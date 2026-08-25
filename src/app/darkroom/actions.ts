"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
import type { Bucket } from "@/lib/gallery";

export type DarkroomState = { status: "idle" | "error" | "ok"; message: string };

/** Files relocated per save when an album's visibility changes. */
const MOVE_BATCH = 60;

/** Rows accepted in one recordPhotos call. */
const MAX_BATCH = 200;

function bucketFor(visibility: string): Bucket {
  return visibility === "members" ? "gallery-private" : "gallery";
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

async function requireOwner() {
  const viewer = await getViewer();
  if (!viewer?.isOwner) throw new Error("Owner access only.");
  return viewer;
}

export async function createAlbum(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const place = String(formData.get("place") ?? "").trim() || null;
  const yearRaw = String(formData.get("year") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "public");
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (title.length < 2) {
    return { status: "error", message: "Give the gallery a title first." };
  }
  if (!SLUG.test(slug)) {
    return {
      status: "error",
      message: "The slug needs to be lowercase words joined by hyphens.",
    };
  }
  if (visibility !== "public" && visibility !== "members") {
    return { status: "error", message: "Visibility must be public or members." };
  }

  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
    return { status: "error", message: "That year doesn't look right." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("albums")
    .insert({ title, subtitle, place, year, visibility, slug });

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? `The slug "${slug}" is already taken.` : error.message,
    };
  }

  revalidatePath("/darkroom");
  revalidatePath("/work");
  return { status: "ok", message: `Filed as /work/${slug}.` };
}

export async function updateAlbum(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const visibility = String(formData.get("visibility") ?? "public");
  const slug = String(formData.get("slug") ?? "");

  if (visibility !== "public" && visibility !== "members") {
    return { status: "error", message: "Visibility must be public or members." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("albums").update({ visibility }).eq("id", id);

  if (error) return { status: "error", message: error.message };

  // Flipping the flag alone used to leave existing plates in the bucket they
  // were uploaded to. A gallery held back after the fact kept serving its
  // photographs from the public bucket, on unsigned URLs that never expire —
  // so "held back" was true of the page and false of the files. Move them.
  const target = bucketFor(visibility);
  const { data: strays } = await supabase
    .from("photos")
    .select("id, bucket, path, thumb_path")
    .eq("album_id", id)
    .neq("bucket", target)
    .limit(MOVE_BATCH + 1);

  const queue = strays ?? [];
  const more = queue.length > MOVE_BATCH;
  let moved = 0;
  let stuck = "";

  for (const photo of queue.slice(0, MOVE_BATCH)) {
    const from = photo.bucket as Bucket;
    const paths = [photo.path, photo.thumb_path].filter(
      (path): path is string => typeof path === "string" && path.length > 0,
    );

    let ok = true;
    for (const path of paths) {
      const { error: moveError } = await supabase.storage
        .from(from)
        .move(path, path, { destinationBucket: target });
      // Already at the destination from a half-finished earlier run.
      if (moveError && !/exists/i.test(moveError.message)) {
        ok = false;
        stuck ||= moveError.message;
        break;
      }
    }

    // The row follows the file, never the other way round: a row pointing at
    // a bucket the file is not in renders a dead image.
    if (ok) {
      const { error: rowError } = await supabase
        .from("photos")
        .update({ bucket: target })
        .eq("id", photo.id);
      if (!rowError) moved += 1;
    }
  }

  revalidatePath("/darkroom");
  revalidatePath(`/darkroom/${slug}`);
  revalidatePath(`/work/${slug}`);
  revalidatePath("/work");
  revalidatePath("/");

  const gate =
    visibility === "members"
      ? "Held back — signed-in visitors only."
      : "Open to everyone.";

  if (stuck) {
    return {
      status: "error",
      message: `${gate} ${moved} file${moved === 1 ? "" : "s"} moved, then: ${stuck}`,
    };
  }
  if (more) {
    return {
      status: "ok",
      message: `${gate} Moved ${moved} plates — more remain, save again to continue.`,
    };
  }
  return {
    status: "ok",
    message: moved > 0 ? `${gate} ${moved} plate${moved === 1 ? "" : "s"} moved.` : gate,
  };
}

export async function deleteAlbum(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const confirm = String(formData.get("confirm") ?? "").trim();
  const slug = String(formData.get("slug") ?? "");

  if (confirm !== slug) {
    return {
      status: "error",
      message: `Type the slug "${slug}" to confirm — this removes the gallery and its plates.`,
    };
  }

  const supabase = await createClient();

  // Clear the stored files before the rows that point at them. Paged, because
  // a single select caps out and would leave the tail of a long album as
  // orphaned files nothing references any more.
  const PAGE = 500;
  for (let from = 0; ; from += PAGE) {
    const { data: batch } = await supabase
      .from("photos")
      .select("bucket, path, thumb_path")
      .eq("album_id", id)
      .range(from, from + PAGE - 1);

    if (!batch || batch.length === 0) break;

    for (const bucket of ["gallery", "gallery-private"] as const) {
      const paths = batch
        .filter((p) => p.bucket === bucket)
        .flatMap((p) => (p.thumb_path ? [p.path, p.thumb_path] : [p.path]));
      if (paths.length > 0) await supabase.storage.from(bucket).remove(paths);
    }

    if (batch.length < PAGE) break;
  }

  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/darkroom");
  revalidatePath("/work");
  return { status: "ok", message: "Gallery removed." };
}

export type PhotoInput = {
  bucket: Bucket;
  path: string;
  thumbPath: string | null;
  caption: string | null;
  place: string | null;
  takenOn: string | null;
  width: number | null;
  height: number | null;
  position: number;
};

/**
 * Called once after the browser has uploaded a whole batch straight to
 * Storage. One insert and one revalidation pass for the batch — recording
 * plate by plate meant a 100-photo upload fired 400 path revalidations.
 */
export async function recordPhotos(input: {
  albumId: string;
  slug: string;
  photos: PhotoInput[];
}): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const { albumId, slug, photos } = input;

  if (!Array.isArray(photos) || photos.length === 0) {
    return { status: "error", message: "Nothing to record." };
  }
  if (photos.length > MAX_BATCH) {
    return {
      status: "error",
      message: `That's ${photos.length} plates in one go. Upload at most ${MAX_BATCH} at a time.`,
    };
  }

  // The browser chose these paths, so check them rather than trust them: a
  // row may only ever point inside its own album's folder.
  const prefix = `${slug}/`;
  for (const photo of photos) {
    if (photo.bucket !== "gallery" && photo.bucket !== "gallery-private") {
      return { status: "error", message: "Unknown bucket." };
    }
    for (const path of [photo.path, photo.thumbPath]) {
      if (path !== null && !path.startsWith(prefix)) {
        return { status: "error", message: "A file path escaped this gallery." };
      }
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("photos").insert(
    photos.map((photo) => ({
      album_id: albumId,
      bucket: photo.bucket,
      path: photo.path,
      thumb_path: photo.thumbPath,
      caption: photo.caption,
      place: photo.place,
      taken_on: photo.takenOn,
      width: photo.width,
      height: photo.height,
      position: photo.position,
    })),
  );

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/darkroom/${slug}`);
  revalidatePath(`/work/${slug}`);
  revalidatePath("/work");
  revalidatePath("/");
  return {
    status: "ok",
    message: `${photos.length} plate${photos.length === 1 ? "" : "s"} filed.`,
  };
}

export async function deletePhoto(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("bucket, path, thumb_path")
    .eq("id", id)
    .maybeSingle();

  if (photo) {
    const paths = photo.thumb_path ? [photo.path, photo.thumb_path] : [photo.path];
    await supabase.storage.from(photo.bucket).remove(paths);
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/darkroom/${slug}`);
  revalidatePath(`/work/${slug}`);
  revalidatePath("/work");
  revalidatePath("/");
  return { status: "ok", message: "Plate removed." };
}

export async function setCover(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const albumId = String(formData.get("albumId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  await supabase.from("photos").update({ is_cover: false }).eq("album_id", albumId);
  const { error } = await supabase.from("photos").update({ is_cover: true }).eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/darkroom/${slug}`);
  revalidatePath("/work");
  return { status: "ok", message: "Cover set." };
}

/* ------------------------------------------------------------- blocks */

const MAX_BODY = 1200;

/** Revalidate every surface a gallery's prose appears on. */
function touchAlbum(slug: string) {
  revalidatePath(`/darkroom/${slug}`);
  revalidatePath(`/work/${slug}`);
}

export async function addBlock(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const albumId = String(formData.get("albumId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const kind = String(formData.get("kind") ?? "text");
  const body = String(formData.get("body") ?? "").trim();

  if (kind !== "text" && kind !== "rule") {
    return { status: "error", message: "Unknown block kind." };
  }
  if (kind === "text" && body.length === 0) {
    return { status: "error", message: "Write something first — an empty band renders as nothing." };
  }
  if (body.length > MAX_BODY) {
    return {
      status: "error",
      message: `That's ${body.length} characters. The limit is ${MAX_BODY} — split it into two bands.`,
    };
  }

  const supabase = await createClient();

  // Append: read the album's own highest position rather than counting rows,
  // which would collide after a delete.
  const { data: last } = await supabase
    .from("blocks")
    .select("position")
    .eq("album_id", albumId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("blocks").insert({
    album_id: albumId,
    kind,
    body: kind === "text" ? body : null,
    position: (last?.position ?? -1) + 1,
  });

  if (error) return { status: "error", message: error.message };

  touchAlbum(slug);
  return { status: "ok", message: kind === "text" ? "Band added." : "Break added." };
}

export async function updateBlock(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (body.length === 0) {
    return { status: "error", message: "Write something, or remove the band." };
  }
  if (body.length > MAX_BODY) {
    return { status: "error", message: `That's ${body.length} characters. The limit is ${MAX_BODY}.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blocks").update({ body }).eq("id", id);
  if (error) return { status: "error", message: error.message };

  touchAlbum(slug);
  return { status: "ok", message: "Band saved." };
}

export async function deleteBlock(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.from("blocks").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };

  touchAlbum(slug);
  return { status: "ok", message: "Band removed." };
}

/**
 * Reorder by swapping positions with the neighbour. Two updates rather than a
 * renumber of the whole album, so a long composition stays cheap to shuffle.
 */
export async function moveBlock(
  _prev: DarkroomState,
  formData: FormData,
): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const albumId = String(formData.get("albumId") ?? "");
  const up = String(formData.get("dir") ?? "up") === "up";

  const supabase = await createClient();
  const { data: self } = await supabase
    .from("blocks")
    .select("id, position")
    .eq("id", id)
    .maybeSingle();

  if (!self) return { status: "error", message: "That band is gone." };

  const { data: neighbour } = await supabase
    .from("blocks")
    .select("id, position")
    .eq("album_id", albumId)
    [up ? "lt" : "gt"]("position", self.position)
    .order("position", { ascending: !up })
    .limit(1)
    .maybeSingle();

  if (!neighbour) return { status: "ok", message: "Already at the end." };

  const a = await supabase.from("blocks").update({ position: neighbour.position }).eq("id", self.id);
  const b = await supabase.from("blocks").update({ position: self.position }).eq("id", neighbour.id);
  if (a.error || b.error) {
    return { status: "error", message: (a.error ?? b.error)!.message };
  }

  touchAlbum(slug);
  return { status: "ok", message: "Moved." };
}

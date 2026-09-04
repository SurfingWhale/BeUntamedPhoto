"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
import { genreIds } from "@/lib/site";

export type DarkroomState = { status: "idle" | "error" | "ok"; message: string };

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
  const genre = String(formData.get("genre") ?? "event");
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
  // Checked here as well as by the database, so a bad value gets a sentence
  // rather than a constraint violation.
  if (!genreIds.includes(genre as (typeof genreIds)[number])) {
    return { status: "error", message: "Pick one of the listed genres." };
  }

  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
    return { status: "error", message: "That year doesn't look right." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("albums")
    .insert({ title, subtitle, place, year, visibility, genre, slug });

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

/* How many plates one save relocates. Held low so a long album cannot time the
 * action out; the save reports what is left and moving the rest is another
 * click on the same control. */
const RELOCATE_BATCH = 60;

type Stray = { id: string; path: string; bucket: string };

/**
 * Move an album's files to the bucket its visibility implies.
 *
 * Holding a gallery back used to be cosmetic. `updateAlbum` flipped
 * `albums.visibility` and left the files alone, but `withUrls` picks a signed
 * URL or a public one from `photos.bucket`, not from the album — so plates
 * uploaded while the album was public kept being served from the public bucket
 * on unsigned URLs that never expire. The page said "signed-in only"; the
 * photographs stayed on the open internet for anyone holding a link.
 *
 * The order per plate is copy, then the row, then delete the source. Every
 * interruption point leaves `photos.bucket` naming a bucket that really holds
 * the file, so a half-finished move renders rather than 404s.
 */
async function relocate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  albumId: string,
  target: "gallery" | "gallery-private",
): Promise<{ moved: number; remaining: number; error: string | null }> {
  const { data, error } = await supabase
    .from("photos")
    .select("id, path, bucket")
    .eq("album_id", albumId)
    .neq("bucket", target)
    .limit(RELOCATE_BATCH + 1);

  if (error) return { moved: 0, remaining: 0, error: error.message };

  const strays = (data ?? []) as Stray[];
  const batch = strays.slice(0, RELOCATE_BATCH);
  let moved = 0;

  for (const photo of batch) {
    const { error: copyError } = await supabase.storage
      .from(photo.bucket)
      .copy(photo.path, photo.path, { destinationBucket: target });

    // A retry after a partial run finds the file already copied, which is the
    // state we wanted, not a failure.
    const duplicate = copyError?.message?.toLowerCase().includes("exist");
    if (copyError && !duplicate) {
      return { moved, remaining: strays.length - moved, error: copyError.message };
    }

    const { error: rowError } = await supabase
      .from("photos")
      .update({ bucket: target })
      .eq("id", photo.id);
    if (rowError) {
      return { moved, remaining: strays.length - moved, error: rowError.message };
    }

    await supabase.storage.from(photo.bucket).remove([photo.path]);
    moved += 1;
  }

  return { moved, remaining: Math.max(0, strays.length - moved), error: null };
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
  const genre = String(formData.get("genre") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const place = String(formData.get("place") ?? "").trim() || null;
  const yearRaw = String(formData.get("year") ?? "").trim();

  if (visibility !== "public" && visibility !== "members") {
    return { status: "error", message: "Visibility must be public or members." };
  }
  if (!genreIds.includes(genre as (typeof genreIds)[number])) {
    return { status: "error", message: "Pick one of the listed genres." };
  }
  if (title.length < 2) {
    return { status: "error", message: "Give the gallery a title first." };
  }
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
    return { status: "error", message: "That year doesn't look right." };
  }

  const supabase = await createClient();
  const target = visibility === "members" ? "gallery-private" : "gallery";

  /* Which half runs first is a safety decision, not a style one.
   *
   * Holding back: close the page first. The album stops listing the plates
   * immediately, and the files follow. Anything already public stays reachable
   * for the length of the move — but no new link to it is being handed out.
   *
   * Opening up: move the files first. Flipping the album public while its
   * plates were still private would leave anonymous visitors unable to sign a
   * URL for them, so the gallery would open onto missing images. */
  /* The slug is deliberately not editable here.
   *
   * It is the public URL, and this site's whole job is that a link can be
   * pasted into a client's chat — changing it silently breaks every message
   * already sent. It is also the folder prefix every photos.path was written
   * with, so a rename would leave the files behind under the old name. The
   * words a visitor reads are the title; that is what renaming should change. */
  const flip = () =>
    supabase
      .from("albums")
      .update({ visibility, genre, title, subtitle, place, year })
      .eq("id", id);

  if (visibility === "members") {
    const { error } = await flip();
    if (error) return { status: "error", message: error.message };
  }

  const { moved, remaining, error: moveError } = await relocate(supabase, id, target);

  if (visibility === "public" && !moveError) {
    const { error } = await flip();
    if (error) return { status: "error", message: error.message };
  }

  revalidatePath("/darkroom");
  revalidatePath(`/darkroom/${slug}`);
  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
  // The genre pages list by genre, so both the one it left and the one it
  // joined are now wrong until they rebuild.
  for (const g of genreIds) revalidatePath(`/work/genre/${g}`);

  if (moveError) {
    return {
      status: "error",
      message: `Moved ${moved} of the files, then stopped: ${moveError} — save again to carry on.`,
    };
  }

  const settled =
    visibility === "members"
      ? "Held back — signed-in visitors only."
      : "Open to everyone.";
  const note =
    moved > 0
      ? ` Moved ${moved} ${moved === 1 ? "file" : "files"} to the ${
          target === "gallery-private" ? "private" : "public"
        } bucket.`
      : "";
  const more = remaining > 0 ? ` ${remaining} still to move — save again.` : "";

  return { status: "ok", message: settled + note + more };
}

/**
 * Move one plate up or down its album.
 *
 * `photos.position` has been in the schema and read in order since the start,
 * but nothing ever wrote to it after the upload, so a set arrived in whatever
 * order the files were picked and stayed there. The sequence of a photo essay
 * is the composition; this is the control that was missing.
 *
 * The whole album is renumbered on every move rather than the two rows being
 * swapped. Older rows can share a position — the column defaults to 0 — and a
 * swap between two rows that both say 0 does nothing at all. Renumbering makes
 * the order well-defined no matter what it was before.
 */
export async function movePhoto(
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
  const dir = String(formData.get("dir") ?? "");

  if (dir !== "up" && dir !== "down") {
    return { status: "error", message: "Move a plate up or down." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id")
    .eq("album_id", albumId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return { status: "error", message: error.message };

  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  const from = ids.indexOf(id);
  if (from < 0) return { status: "error", message: "That plate is not in this gallery." };

  const to = dir === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= ids.length) {
    // Already at the end. Not an error worth a red message.
    return { status: "ok", message: dir === "up" ? "Already first." : "Already last." };
  }

  [ids[from], ids[to]] = [ids[to], ids[from]];

  const writes = await Promise.all(
    ids.map((photoId, i) =>
      supabase.from("photos").update({ position: i }).eq("id", photoId),
    ),
  );
  const failed = writes.find((w) => w.error);
  if (failed?.error) return { status: "error", message: failed.error.message };

  revalidatePath(`/darkroom/${slug}`);
  revalidatePath(`/work/${slug}`);
  return { status: "ok", message: `Moved to position ${to + 1} of ${ids.length}.` };
}

/**
 * Point a plate at a freshly encoded file and delete the one it replaced.
 *
 * The client uploads the new object first, so the order here is row, then
 * delete — at every interruption point `photos.path` names a file that exists.
 * Losing the delete leaves an orphan, which costs storage; losing it the other
 * way round would leave a gallery pointing at nothing.
 */
export async function swapPlateFile(input: {
  id: string;
  newPath: string;
  oldPath: string;
  bucket: string;
  width: number | null;
  height: number | null;
}): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("photos")
    .update({ path: input.newPath, width: input.width, height: input.height })
    .eq("id", input.id);

  if (error) return { status: "error", message: error.message };

  if (input.oldPath !== input.newPath) {
    await supabase.storage.from(input.bucket).remove([input.oldPath]);
  }

  revalidatePath("/darkroom");
  revalidatePath("/work");
  return { status: "ok", message: "Replaced." };
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

  // Clear the stored files before the rows that point at them.
  const { data: photos } = await supabase
    .from("photos")
    .select("bucket, path")
    .eq("album_id", id);

  for (const bucket of ["gallery", "gallery-private"] as const) {
    const paths = (photos ?? []).filter((p) => p.bucket === bucket).map((p) => p.path);
    if (paths.length > 0) await supabase.storage.from(bucket).remove(paths);
  }

  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/darkroom");
  revalidatePath("/work");
  return { status: "ok", message: "Gallery removed." };
}

/** Called after the browser has uploaded the file straight to Storage. */
export async function recordPhoto(input: {
  albumId: string;
  slug: string;
  bucket: "gallery" | "gallery-private";
  path: string;
  caption: string | null;
  place: string | null;
  takenOn: string | null;
  width: number | null;
  height: number | null;
  position: number;
}): Promise<DarkroomState> {
  try {
    await requireOwner();
  } catch {
    return { status: "error", message: "Owner access only." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("photos").insert({
    album_id: input.albumId,
    bucket: input.bucket,
    path: input.path,
    caption: input.caption,
    place: input.place,
    taken_on: input.takenOn,
    width: input.width,
    height: input.height,
    position: input.position,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/darkroom/${input.slug}`);
  revalidatePath(`/work/${input.slug}`);
  revalidatePath("/work");
  revalidatePath("/");
  return { status: "ok", message: "Plate added." };
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
    .select("bucket, path")
    .eq("id", id)
    .maybeSingle();

  if (photo) {
    await supabase.storage.from(photo.bucket).remove([photo.path]);
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

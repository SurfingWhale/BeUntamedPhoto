"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";

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

  revalidatePath("/darkroom");
  revalidatePath(`/darkroom/${slug}`);
  revalidatePath("/work");
  return {
    status: "ok",
    message:
      visibility === "members"
        ? "Held back — signed-in visitors only."
        : "Open to everyone.",
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

import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Album = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  place: string | null;
  year: number | null;
  visibility: "public" | "members";
  position: number;
};

export type Photo = {
  id: string;
  album_id: string;
  bucket: "gallery" | "gallery-private";
  path: string;
  caption: string | null;
  place: string | null;
  taken_on: string | null;
  width: number | null;
  height: number | null;
  position: number;
  is_cover: boolean;
};

export type PhotoWithUrl = Photo & { url: string | null };

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/**
 * Public-bucket files get a plain public URL; private-bucket files get a signed
 * one. Signing is batched per bucket so a 40-photo album is two round trips.
 */
export async function withUrls(photos: Photo[]): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const signed = new Map<string, string>();

  const privatePaths = photos
    .filter((p) => p.bucket === "gallery-private")
    .map((p) => p.path);

  if (privatePaths.length > 0) {
    const { data } = await supabase.storage
      .from("gallery-private")
      .createSignedUrls(privatePaths, SIGNED_URL_TTL);

    for (const row of data ?? []) {
      if (row.path && row.signedUrl) signed.set(row.path, row.signedUrl);
    }
  }

  return photos.map((p) => {
    if (p.bucket === "gallery-private") {
      return { ...p, url: signed.get(p.path) ?? null };
    }
    const { data } = supabase.storage.from("gallery").getPublicUrl(p.path);
    return { ...p, url: data.publicUrl };
  });
}

export async function getAlbums(): Promise<Album[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Album[];
}

export async function getAlbum(slug: string): Promise<Album | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Album) ?? null;
}

export async function getPhotos(albumId: string): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return withUrls((data ?? []) as Photo[]);
}

/** One cover per album, for the index grid. */
export async function getCovers(
  albumIds: string[],
): Promise<Map<string, PhotoWithUrl>> {
  if (albumIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .in("album_id", albumIds)
    .order("is_cover", { ascending: false })
    .order("position", { ascending: true });

  const first = new Map<string, Photo>();
  for (const p of (data ?? []) as Photo[]) {
    if (!first.has(p.album_id)) first.set(p.album_id, p);
  }
  const withUrl = await withUrls([...first.values()]);
  return new Map(withUrl.map((p) => [p.album_id, p]));
}

/** Photos across every album the viewer may see — the home-page folds. */
export async function getFeatured(limit = 6): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .order("is_cover", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return withUrls((data ?? []) as Photo[]);
}

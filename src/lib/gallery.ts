import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PRIVATE_WIDTH, publicSrc, publicSrcSet, QUALITY } from "@/lib/images";
import type { Genre } from "@/lib/site";

export type Album = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  place: string | null;
  year: number | null;
  visibility: "public" | "members";
  genre: Genre;
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

export type PhotoWithUrl = Photo & {
  /** The default source — a resized render, never the stored original. */
  url: string | null;
  /** Widths the browser may choose from. Null for private files, which can
   * only afford one signed width each. */
  srcSet: string | null;
};

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/**
 * Every URL here is a resized render, never the stored object — see
 * `lib/images.ts` for why. Public files build their URL as a string and carry a
 * full srcset; private files are signed one at a time, because the transform is
 * signed into the token and the batch signer takes no transform options.
 */
export async function withUrls(photos: Photo[]): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const signed = new Map<string, string>();

  const privatePaths = photos
    .filter((p) => p.bucket === "gallery-private")
    .map((p) => p.path);

  if (privatePaths.length > 0) {
    // In parallel: N fast API calls beat one round trip that hands back a
    // 7 MB original.
    const results = await Promise.all(
      privatePaths.map(async (path) => {
        const { data } = await supabase.storage
          .from("gallery-private")
          .createSignedUrl(path, SIGNED_URL_TTL, {
            // Height and resize for the same reason as publicSrc: width alone
            // leaves the other axis at the source value and squashes the plate.
            transform: {
              width: PRIVATE_WIDTH,
              height: PRIVATE_WIDTH * 3,
              resize: "contain",
              quality: QUALITY,
            },
          });
        return [path, data?.signedUrl ?? null] as const;
      }),
    );
    for (const [path, signedUrl] of results) {
      if (signedUrl) signed.set(path, signedUrl);
    }
  }

  return photos.map((p) => {
    if (p.bucket === "gallery-private") {
      return { ...p, url: signed.get(p.path) ?? null, srcSet: null };
    }
    return {
      ...p,
      url: publicSrc("gallery", p.path, PRIVATE_WIDTH, p.width, p.height),
      srcSet: publicSrcSet("gallery", p.path, p.width, p.height),
    };
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

/**
 * Plates still stored as an oversized original.
 *
 * Everything uploaded before the encoder worked is here: 27 files, 423
 * megapixels, published as "0% smaller" because the WebP guard was
 * all-or-nothing. Delivery is already fine — the render endpoint resizes on
 * the way out — so this is about what the bucket is holding.
 */
export async function getOversizedPhotos(limit = 200): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(limit);

  const rows = (data ?? []) as Photo[];
  const stale = rows.filter(
    (p) => !p.path.toLowerCase().endsWith(".webp") || (p.width ?? 0) > 2400,
  );
  return withUrls(stale);
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

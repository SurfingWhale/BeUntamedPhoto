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
 * Private files are signed one request each, so the fan-out has to be bounded.
 * An unbounded Promise.all over a 500-plate album opens 500 sockets at once and
 * Supabase starts refusing them — which surfaces as plates that silently have
 * no URL rather than as an error.
 */
const SIGN_CHUNK = 24;

/** Plates per page, on the public gallery and in the darkroom alike. */
export const PER_PAGE = 24;

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
};

/** A page number out of a query string, clamped to something sane. */
export function clampPage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

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

  // In parallel, but in bounded batches — see SIGN_CHUNK.
  for (let i = 0; i < privatePaths.length; i += SIGN_CHUNK) {
    const results = await Promise.all(
      privatePaths.slice(i, i + SIGN_CHUNK).map(async (path) => {
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

/**
 * One page of an album.
 *
 * This never selects a whole album, and that is the point. The unpaged version
 * this replaces asked for every row: past PostgREST's row cap the tail came
 * back missing with no error at all — the gallery simply stopped part way and
 * looked complete — and every page load signed a URL for every private plate
 * before rendering a single one.
 */
export async function getPhotoPage(
  albumId: string,
  page = 1,
  perPage = PER_PAGE,
): Promise<Paged<PhotoWithUrl>> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;

  const { data, count } = await supabase
    .from("photos")
    .select("*", { count: "exact" })
    .eq("album_id", albumId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .range(from, from + perPage - 1);

  const total = count ?? 0;
  return {
    items: await withUrls((data ?? []) as Photo[]),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    perPage,
  };
}

/**
 * The highest position in an album, so a new batch appends instead of landing
 * on top of what is already filed.
 */
export async function getMaxPosition(albumId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("position")
    .eq("album_id", albumId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.position ?? -1;
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

import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Bucket = "gallery" | "gallery-private";

export type BlockKind = "text" | "rule";

/** A composed band inside a gallery — prose, or deliberate silence. */
export type Block = {
  id: string;
  album_id: string;
  kind: BlockKind;
  body: string | null;
  position: number;
};

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
  bucket: Bucket;
  path: string;
  thumb_path: string | null;
  caption: string | null;
  place: string | null;
  taken_on: string | null;
  width: number | null;
  height: number | null;
  position: number;
  is_cover: boolean;
};

/** The columns public.album_covers exposes — one row per album. */
export type Cover = {
  album_id: string;
  id: string;
  bucket: Bucket;
  path: string;
  thumb_path: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

/** Anything that points at a stored file, with an optional downscaled copy. */
type Storable = { bucket: Bucket; path: string; thumb_path: string | null };

type Resolved = { url: string | null; thumbUrl: string | null };

export type PhotoWithUrl = Photo & Resolved;
export type CoverWithUrl = Cover & Resolved;

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
};

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/** Signing is one HTTP request per call, so a long album is chunked. */
const SIGN_CHUNK = 100;

/** Plates per page, on the public gallery and in the darkroom alike. */
export const PER_PAGE = 24;

export function clampPage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

/**
 * Public-bucket files get a plain public URL; private-bucket files get a
 * signed one. Thumbnails are resolved in the same pass, and a row without a
 * thumbnail falls back to its original so pre-thumbnail plates still render.
 */
export async function withUrls<T extends Storable>(
  rows: T[],
): Promise<(T & Resolved)[]> {
  const supabase = await createClient();
  const signed = new Map<string, string>();

  const privatePaths = [
    ...new Set(
      rows
        .filter((r) => r.bucket === "gallery-private")
        .flatMap((r) => (r.thumb_path ? [r.path, r.thumb_path] : [r.path])),
    ),
  ];

  for (let i = 0; i < privatePaths.length; i += SIGN_CHUNK) {
    const { data } = await supabase.storage
      .from("gallery-private")
      .createSignedUrls(privatePaths.slice(i, i + SIGN_CHUNK), SIGNED_URL_TTL);

    for (const row of data ?? []) {
      if (row.path && row.signedUrl) signed.set(row.path, row.signedUrl);
    }
  }

  return rows.map((r) => {
    const resolve =
      r.bucket === "gallery-private"
        ? (path: string) => signed.get(path) ?? null
        : (path: string) =>
            supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;

    const url = resolve(r.path);
    return { ...r, url, thumbUrl: r.thumb_path ? resolve(r.thumb_path) : url };
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
 * One page of an album. Never selects the whole album: past a few hundred
 * plates that hits PostgREST's row cap and silently drops the tail.
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

/** Highest position in an album, so a new batch appends instead of colliding. */
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

/** One cover per album, chosen in Postgres rather than by reading everything. */
export async function getCovers(
  albumIds: string[],
): Promise<Map<string, CoverWithUrl>> {
  if (albumIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase
    .from("album_covers")
    .select("*")
    .in("album_id", albumIds);

  const withUrl = await withUrls((data ?? []) as Cover[]);
  return new Map(withUrl.map((c) => [c.album_id, c]));
}

/**
 * The composed bands for a gallery. Small and bounded by design — this is
 * prose, not plates — so it is fetched whole rather than paged.
 */
export async function getBlocks(albumId: string): Promise<Block[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("*")
    .eq("album_id", albumId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(100);
  return (data ?? []) as Block[];
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

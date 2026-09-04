import "server-only";

import { unstable_cache } from "next/cache";

import { getViewer } from "@/lib/auth";
import { createAnonClient } from "@/lib/supabase/anon";
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

/** An album with the one photograph that fronts it. */
export type AlbumWithCover = Album & { cover: PhotoWithUrl | null };

const ALBUM_COLUMNS =
  "id, slug, title, subtitle, place, year, visibility, genre, position";
/** Drops the embedded array; the cover is returned on its own key. */
function stripPhotos(row: Album & { photos: Photo[] }): Album {
  const { photos: _photos, ...album } = row;
  void _photos;
  return album;
}

const PHOTO_COLUMNS =
  "id, album_id, bucket, path, caption, place, taken_on, width, height, position, is_cover";

/**
 * Albums and their covers in one round trip.
 *
 * This replaces getAlbums followed by getCovers. A round trip to this project
 * measures about 330ms, and the payload barely registers — all 28 photo rows
 * came back in 313ms, a narrower column list in 348ms, which is noise. So the
 * cost of a page is the number of sequential queries, not the size of them,
 * and two became one.
 *
 * The embed is capped at one photo per album. Without the limit a 200-plate
 * gallery would return all 200 rows to pick a single cover, which is the
 * shape getCovers had: it read every photograph of every album and chose the
 * first in JavaScript, so past PostgREST's row cap the later albums would have
 * silently had no cover at all.
 */
/** The tag every darkroom write invalidates. */
export const ALBUMS_TAG = "albums";

/**
 * The signed-out view of the index, cached.
 *
 * Cached with a session-less client on purpose. RLS then returns exactly what
 * an anonymous visitor may see, so the cache can never come to hold a
 * held-back gallery's plates — and it is only ever read on the signed-out
 * path, so it can never be served to the wrong person either. A signed-in
 * visitor queries live, because their view legitimately contains more.
 */
const readPublicAlbums = unstable_cache(
  async (genre?: string) => {
    const supabase = createAnonClient();
    return runAlbumQuery(supabase, genre);
  },
  ["albums-with-covers"],
  { tags: [ALBUMS_TAG], revalidate: 300 },
);

type AlbumRow = Album & { photos: Photo[] };

async function runAlbumQuery(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAnonClient>,
  genre?: string,
): Promise<AlbumRow[]> {
  /* Ordered by when the work was made, not when it was uploaded.
   *
   * `year` is the album-level date the darkroom form already asks for, so it
   * leads. nullsFirst false keeps the sets with no year from jumping to the
   * top — they fall back to upload order behind everything dated. `position`
   * stays as a tiebreaker so a set can still be pinned by hand within a year.
   *
   * Only three of six albums carry a year today; the rest sort by upload until
   * that field is filled. */
  let query = supabase
    .from("albums")
    .select(`${ALBUM_COLUMNS}, photos(${PHOTO_COLUMNS})`)
    .order("year", { ascending: false, nullsFirst: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .order("is_cover", { ascending: false, referencedTable: "photos" })
    .order("position", { ascending: true, referencedTable: "photos" })
    .limit(1, { referencedTable: "photos" });

  if (genre) query = query.eq("genre", genre);
  const { data, error } = await query;
  if (error) {
    // Swallowing this is how an empty index looks like an empty archive: the
    // page still renders 200, just with nothing in it.
    console.error("[gallery] album query failed:", error.message, error.details);
    throw new Error(`Could not read the archive: ${error.message}`);
  }
  return (data ?? []) as AlbumRow[];
}

export async function getAlbumsWithCovers(genre?: string): Promise<AlbumWithCover[]> {
  const viewer = await getViewer();
  const rows = viewer
    ? await runAlbumQuery(await createClient(), genre)
    : await readPublicAlbums(genre);

  // One signing pass for every cover, rather than one per album.
  const covers = await withUrls(rows.map((r) => r.photos?.[0]).filter(Boolean));
  const byId = new Map(covers.map((c) => [c.album_id, c]));

  return rows.map((row) => ({
    ...stripPhotos(row),
    cover: byId.get(row.id) ?? null,
  }));
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


async function runFeaturedQuery(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAnonClient>,
  limit: number,
): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select(PHOTO_COLUMNS)
    .order("is_cover", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[gallery] featured query failed:", error.message, error.details);
    throw new Error(`Could not read the archive: ${error.message}`);
  }
  return (data ?? []) as Photo[];
}

const readPublicFeatured = unstable_cache(
  async (limit: number) => runFeaturedQuery(createAnonClient(), limit),
  ["featured-photos"],
  { tags: [ALBUMS_TAG], revalidate: 300 },
);

/**
 * Photos across every album the viewer may see — the home-page folds.
 *
 * Same split as the index: the signed-out result is cached behind a
 * session-less client, so RLS decides what may be in the cache rather than
 * the cache deciding what RLS meant.
 */
export async function getFeatured(limit = 6): Promise<PhotoWithUrl[]> {
  const viewer = await getViewer();
  const rows = viewer
    ? await runFeaturedQuery(await createClient(), limit)
    : await readPublicFeatured(limit);
  return withUrls(rows);
}

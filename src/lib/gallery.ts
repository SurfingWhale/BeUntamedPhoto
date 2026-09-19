import "server-only";

import { unstable_cache } from "next/cache";

import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import {
  CARD_THUMB_PHONE_WIDTH,
  CARD_THUMB_WIDTH,
  PRIVATE_WIDTH,
  publicSrc,
  publicSrcSet,
  QUALITY,
} from "@/lib/images";
import type { Genre } from "@/lib/site";

export type Album = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  /**
   * What the job was, in the owner's words — the paragraph on the gallery
   * page, where `subtitle` is the one line on the card before you tap.
   *
   * Optional on the type, like `featured_rank`, because the column may not
   * exist yet: `supabase/add-album-story.sql` is a migration somebody has to
   * run, and asking for a column that is not there fails the whole select.
   * `getAlbum` reads `select("*")` so it arrives on its own once the column
   * does; ALBUM_COLUMNS deliberately does **not** list it, because that query
   * feeds every card on the site and must not be the thing that breaks while
   * the migration is outstanding.
   */
  story?: string | null;
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
  /**
   * Which slot on the home page this plate fills, 1-4, or null for "not
   * chosen". See supabase/add-featured-rank.sql for what each number is.
   * Optional on the type because the column may not exist yet — the query
   * below falls back rather than breaking the site while the migration is
   * still un-run.
   */
  featured_rank?: number | null;
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
export async function withUrls(
  photos: Photo[],
  /* How wide the caller will actually paint these. The default is the reading
   * width; the darkroom's contact sheet asks for a thumbnail and was being
   * handed 1500px for a 96px box. */
  width: number = PRIVATE_WIDTH,
): Promise<PhotoWithUrl[]> {
  const signed = new Map<string, string>();

  const privatePaths = photos
    .filter((p) => p.bucket === "gallery-private")
    .map((p) => p.path);

  /* The cookie-bound client is built only when there is something to sign.
   * Reading a cookie is what makes a page render per request, and an album of
   * public plates needs no signature at all — so a public gallery no longer
   * pays for one, which is what lets the page holding it be cached. */
  if (privatePaths.length > 0) {
    const supabase = await createClient();
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
              width,
              height: width * 3,
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
      url: publicSrc("gallery", p.path, width, p.width, p.height),
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

/* Album metadata is world-readable — supabase/rls-albums.sql says so and why —
 * so the anonymous client returns exactly the rows the cookie-bound one would,
 * and costs the caller no cookie. */
export async function getAlbum(slug: string): Promise<Album | null> {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Album) ?? null;
}

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
 * One page of an album.
 *
 * This never selects a whole album, and that is the point. The unpaged version
 * it replaces asked for every row, which failed two ways at once. Past
 * PostgREST's row cap the tail came back missing with no error — the gallery
 * stopped part way and looked complete. And every page load signed a URL for
 * every private plate before rendering a single one.
 */
export async function getPhotoPage(
  albumId: string,
  page = 1,
  perPage = PER_PAGE,
  /* "public" reads as nobody, which is what an open gallery needs and what
   * lets the page holding it be cached. A held-back gallery has to ask as the
   * viewer, or its own plates are invisible to it. */
  scope: "public" | "viewer" = "viewer",
  /* The darkroom paints 96px squares and does not need reading width. */
  width: number = PRIVATE_WIDTH,
): Promise<Paged<PhotoWithUrl>> {
  const supabase = scope === "public" ? createAnonClient() : await createClient();
  const from = (page - 1) * perPage;

  const { data, count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact" })
    .eq("album_id", albumId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .range(from, from + perPage - 1);

  // Same reason the album query throws: a swallowed error here renders an
  // empty gallery at 200, which reads as "nothing filed" rather than "broken".
  if (error) {
    /* An offset past the last row is a wrong URL, not a broken gallery.
     *
     * PostgREST answers a range it cannot satisfy with PGRST103 — "An offset
     * of 24 was requested, but there are only 7 rows" — and throwing on it
     * meant /work/in-bloom/p/2 answered 500. AlbumView already knows what to
     * do with a page past the end; it just never got the chance, because this
     * threw first. Returning the page as empty with the real total lets that
     * guard turn it into the 404 it always meant to be.
     *
     * The extra count query only ever runs on this path, so a gallery that
     * pages normally still costs one round trip. */
    if (error.code === "PGRST103" || /range not satisfiable/i.test(error.message)) {
      const { count: real } = await supabase
        .from("photos")
        .select("id", { count: "exact", head: true })
        .eq("album_id", albumId);
      const total = real ?? 0;
      return {
        items: [],
        total,
        page,
        pages: Math.max(1, Math.ceil(total / perPage)),
        perPage,
      };
    }
    console.error("[gallery] plate page failed:", error.message, error.details);
    throw new Error(`Could not read the gallery: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    items: await withUrls((data ?? []) as Photo[], width),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    perPage,
  };
}

/**
 * The highest position in an album, so a new batch appends instead of landing
 * on top of what is already filed.
 *
 * The darkroom used to reduce over the rows on screen for this, which was
 * right only while every row was on screen. On page two it would hand the
 * uploader a position that is already taken.
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

/**
 * One plate in a card's contact strip: an id to key on and one small source.
 *
 * Deliberately not a `PhotoWithUrl`. The index is a client component, so every
 * field of every object handed to it is serialised into the HTML as the RSC
 * payload whether or not anything renders it — and on a prerendered page that
 * payload sits in a shared cache (CLAUDE.md). A full `PhotoWithUrl` carries a
 * seven-candidate `srcSet` of ~180-character URLs; twenty-one of those is
 * about 50KB of markup describing widths a fixed 89px box can never use. The
 * strip asks for one width, so one width is what leaves the server.
 */
/** `src` is the phone's file; `srcWide` the one a <picture> swaps in above
 * 60rem, where the box is twice the size. */
export type StripPlate = { id: string; src: string; srcWide: string };

/**
 * An album with the one photograph that fronts it, and optionally a few more
 * from inside it.
 *
 * `plates` is empty unless the caller asked for it. The home index does,
 * because a card carrying one cover says which galleries exist and nothing
 * about what any of them was — see the contact strip in `index-filter.tsx`.
 * `/work` and the genre pages do not: they already open every cover large, and
 * rows nothing renders are still serialised into the payload.
 */
export type AlbumWithCover = Album & {
  cover: PhotoWithUrl | null;
  /** Plates after the cover, in gallery order. Never includes the cover. */
  plates: StripPlate[];
};

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

/* The same list plus the slot column. Kept separate because only the featured
 * query needs it, and asking for a column that does not exist yet fails the
 * whole select — see the fallback in runFeaturedQuery. */
const FEATURED_COLUMNS = `${PHOTO_COLUMNS}, featured_rank`;


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
  async (genre?: string, photosPerAlbum = 1) => {
    const supabase = createAnonClient();
    return runAlbumQuery(supabase, genre, photosPerAlbum);
  },
  ["albums-with-covers"],
  { tags: [ALBUMS_TAG], revalidate: 300 },
);

type AlbumRow = Album & { photos: Photo[] };

async function runAlbumQuery(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAnonClient>,
  genre?: string,
  /* How many photographs to embed per album. One is the cover; anything above
   * that is the contact strip on the home index. Measured when this was
   * written: all 28 photo rows of the archive came back in 313ms against 330ms
   * for the round trip itself, so the cost of this query is the trip, not the
   * rows — but it stays a parameter because the cap is what stops a
   * 200-plate gallery returning 200 rows to draw three boxes. */
  photosPerAlbum = 1,
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
    .limit(photosPerAlbum, { referencedTable: "photos" });

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

/**
 * The index, as anybody sees it.
 *
 * Every caller is a public page that is prerendered and shared, so the read
 * has to be the anonymous one — not as a fallback but as the only correct
 * answer. Asking as the viewer would cost two things at once: `cookies()` is
 * what makes a page render per request and ship `no-store`, and the extra a
 * signed-in viewer would get back is a held-back gallery's cover, which lives
 * in the private bucket behind a short-lived signed link. That link has no
 * business in markup held for five minutes and handed to whoever asks next.
 *
 * Held-back galleries are still listed — album rows are world-readable — they
 * just carry no cover here. The gallery itself asks as the viewer and shows
 * the plates in full.
 */
export async function getAlbumsWithCovers(
  genre?: string,
  /* Plates to carry past the cover, for a caller that shows more than one.
   * Zero keeps the payload exactly the shape it was. */
  plates = 0,
): Promise<AlbumWithCover[]> {
  const rows = await readPublicAlbums(genre, plates + 1);

  /* Two passes, not one, because the two ask for different widths — the cover
   * at the reading width with a full ladder, the strip at one small fixed one.
   * Neither costs a round trip while every plate here is public, which is all
   * of them: this reads as an anonymous visitor, so RLS returns no held-back
   * plate at all.
   *
   * Cover first within each album: the query orders the embed by is_cover
   * descending, then position, so everything behind the first row is the strip
   * in gallery order. */
  const [covers, strip, stripPhone] = await Promise.all([
    withUrls(rows.map((r) => r.photos?.[0]).filter(Boolean)),
    withUrls(
      rows.flatMap((r) => (r.photos ?? []).slice(1)),
      CARD_THUMB_WIDTH,
    ),
    withUrls(
      rows.flatMap((r) => (r.photos ?? []).slice(1)),
      CARD_THUMB_PHONE_WIDTH,
    ),
  ]);

  const byId = new Map(covers.map((c) => [c.album_id, c]));
  const phoneById = new Map(stripPhone.map((p) => [p.id, p.url]));
  const stripByAlbum = new Map<string, StripPlate[]>();
  for (const p of strip) {
    if (!p.url) continue;
    /* The phone file if it built, the wide one if it somehow did not — a
     * missing small URL should cost bytes, not a blank box. */
    const plate: StripPlate = { id: p.id, src: phoneById.get(p.id) ?? p.url, srcWide: p.url };
    const list = stripByAlbum.get(p.album_id);
    if (list) list.push(plate);
    else stripByAlbum.set(p.album_id, [plate]);
  }

  return rows.map((row) => ({
    ...stripPhotos(row),
    cover: byId.get(row.id) ?? null,
    plates: stripByAlbum.get(row.id) ?? [],
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
  /* Owner's choice first, then the old behaviour underneath it.
   *
   * `featured_rank` ascending with nulls last means an assigned plate takes
   * its slot and every unassigned one queues behind in the order this query
   * always used — so the page is never blank while the archive is being
   * arranged, and assigning one slot does not disturb the other three.
   *
   * nullsFirst: false is the whole trick. Postgres sorts NULLs first on an
   * ascending order by default, which would put every unchosen plate ahead of
   * the chosen one and invert the feature. */
  const ranked = await supabase
    .from("photos")
    .select(FEATURED_COLUMNS)
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .order("is_cover", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!ranked.error) return (ranked.data ?? []) as Photo[];

  /* 42703 is "column does not exist". The migration in
   * supabase/add-featured-rank.sql has not been run yet, and a front page that
   * 500s until someone opens the SQL editor is a worse answer than one that
   * orders itself the way it did last week. Every other error still throws. */
  const missingColumn =
    ranked.error.code === "42703" || /featured_rank/.test(ranked.error.message);
  if (!missingColumn) {
    console.error(
      "[gallery] featured query failed:",
      ranked.error.message,
      ranked.error.details,
    );
    throw new Error(`Could not read the archive: ${ranked.error.message}`);
  }

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
 * Photos across the open albums — the home-page folds.
 *
 * Anonymous for the same two reasons as the index: RLS decides what may be in
 * the cache rather than the cache deciding what RLS meant, and no page that
 * calls this reads a cookie, so all of them can be prerendered.
 */
export async function getFeatured(limit = 6): Promise<PhotoWithUrl[]> {
  return withUrls(await readPublicFeatured(limit));
}

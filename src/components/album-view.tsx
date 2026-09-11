import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion";
import { NotesGate } from "@/components/notes-gate";
import { NotesPanel } from "@/components/notes-panel";
import { Pager } from "@/components/pager";
import { Plate } from "@/components/plate";
import { SignedIn } from "@/components/signed-in";
import { SignedOut } from "@/components/signed-out";
import { formatDate, plate } from "@/lib/format";
import { getAlbum, getPhotoPage, PER_PAGE } from "@/lib/gallery";
import { SIZES } from "@/lib/images";
import { getNotes } from "@/lib/notes";

/**
 * One gallery, at one page of plates.
 *
 * Three routes share this, and the shape of the split is the whole reason the
 * file exists.
 *
 * `/work/[slug]` and `/work/[slug]/p/[n]` are the public pair, prerendered and
 * cached. The page number is in the path rather than a query string on purpose:
 * a query string is request data, and a page that reads request data is
 * rendered per request and sent `no-store` — so the arrival every visitor
 * makes first would have been the one page that could never be cached.
 *
 * Neither of those may ask who is reading. Not "should not" — a route with
 * `revalidate` and `generateStaticParams` is generated into the cache, and
 * `cookies()` during that render is a hard error (`DYNAMIC_SERVER_USAGE`),
 * not a quiet fall back to rendering per request. So `mode` is decided by the
 * route, never by the visitor: `"public"` reads as nobody and shows a
 * held-back gallery's notice instead of its plates, and `"private"` is
 * `/work/[slug]/open`, which is dynamic, has already established a viewer, and
 * passes one in.
 *
 * The two places that used to ask on the server and did not need to — the
 * guestbook's heading, and whether it appears at all — ask from the browser
 * now, because markup shared by every reader cannot answer it.
 */
export async function AlbumView({
  slug,
  page: raw,
  mode = "public",
}: {
  slug: string;
  page: number;
  mode?: "public" | "private";
}) {
  const page = Math.max(1, Math.trunc(raw));
  const album = await getAlbum(slug);
  if (!album) notFound();

  const scope = mode === "private" ? "viewer" : "public";
  const locked = mode === "public" && album.visibility === "members";

  const EMPTY = { items: [], total: 0, page: 1, pages: 1, perPage: PER_PAGE };
  const [plates, notes] = await Promise.all([
    locked ? Promise.resolve(EMPTY) : getPhotoPage(album.id, page, PER_PAGE, scope),
    /* No guestbook under a notice. Read as nobody it would come back empty
     * anyway, and an empty comment box under a gallery nobody can see yet is
     * the worst version of it. */
    locked ? Promise.resolve([]) : getNotes(album.id, scope),
  ]);
  const photos = plates.items;

  /* A page number past the end is a wrong URL, not an empty gallery.
   *
   * No `&& total > 0` guard: `pages` is already floored at 1, so page one of
   * an empty album is page one and answers, while page two of an empty album
   * is as wrong an address as page two of a seven-plate one. The old guard
   * let that second case through. */
  if (page > plates.pages) notFound();

  /* Plate numbers count from the start of the album, not the start of the
   * page — plate 25 is plate 25 whichever page it is read on. */
  const offset = (plates.page - 1) * plates.perPage;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">
          {album.year ?? "—"}
          {album.place ? ` · ${album.place}` : ""}
          {album.visibility === "members" ? " · signed-in only" : ""}
          {plates.pages > 1 ? ` · page ${plates.page}/${plates.pages}` : ""}
        </p>
        <h1 className="page__title">{album.title}</h1>
        {album.subtitle && <p className="fold-text__body">{album.subtitle}</p>}
        <p>
          <Link className="link" href="/work">
            ← All galleries
          </Link>
        </p>
      </section>

      {locked ? (
        <section className="fold-text fold-text--tight">
          <div className="head">
            <span className="lock">◆ held back</span>
            <h2 className="head__title">This gallery opens once you&rsquo;re signed in.</h2>
            <p className="head__sub">
              Client work before it runs, and frames still under argument. Free
              to make an account — no mailing list, no follow-up.
            </p>
          </div>
          {/* The notice is what almost every reader gets, so it is what the
              cached page says. Whoever already has a session is told a
              different thing from the browser, and it is a link rather than a
              silent swap: /open is rendered per request, which is the only way
              a held-back gallery can be read at all. */}
          <p>
            <SignedOut>
              <Link
                className="link"
                href={`/enter?next=${encodeURIComponent(`/work/${album.slug}/open`)}`}
              >
                Sign in to open it →
              </Link>
            </SignedOut>
            <SignedIn>
              <Link className="link" href={`/work/${album.slug}/open`}>
                Open the plates →
              </Link>
            </SignedIn>
          </p>
        </section>
      ) : photos.length === 0 ? (
        <section className="page__pad page__pad-b">
          <p className="notes__empty">This gallery is still being filed.</p>
        </section>
      ) : (
        <div className="strip">
          {photos.map((photo, i) => (
            <Reveal as="figure" className="strip__item" key={photo.id} index={i % 2}>
              <p className="strip__no">{plate(offset + i)}</p>
              <div className="strip__frame">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    srcSet={photo.srcSet ?? undefined}
                    sizes={i === 0 ? SIZES.plate : SIZES.plateHalf}
                    alt={photo.caption ?? `${album.title} — plate ${plate(offset + i)}`}
                    width={photo.width ?? undefined}
                    height={photo.height ?? undefined}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                ) : (
                  <div style={{ aspectRatio: "3 / 2" }}>
                    <Plate no={plate(offset + i)} label="file missing" />
                  </div>
                )}
              </div>
              <figcaption className="strip__cap">
                {/* The number is already hung in the margin — the caption
                    carries only what the number cannot say. */}
                {photo.caption && <span>{photo.caption}</span>}
                <span>
                  {[photo.place, formatDate(photo.taken_on)]
                    .filter(Boolean)
                    .join(" · ") || "unfiled"}
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      )}

      {!locked && (
        <Pager
          base={mode === "private" ? `/work/${album.slug}/open` : `/work/${album.slug}`}
          page={plates.page}
          pages={plates.pages}
          total={plates.total}
          perPage={plates.perPage}
          mode={mode === "private" ? "query" : "path"}
        />
      )}

      {/* An empty comment box under every gallery reads as an abandoned site,
          which costs more trust than the feature earns. A signed-out visitor
          only sees this once there is something in it; signed in, the form is
          there to be used.
          Under a held-back notice there is nothing to say a note about yet, so
          it is off the page entirely rather than gated — otherwise a signed-in
          reader who has not opened the plates gets an empty form under a
          gallery they cannot see. */}
      {!locked && (
        <NotesGate hasNotes={notes.length > 0}>
          <section className="fold-text fold-text--tight">
            <div className="head">
              <h2 className="head__title">Notes on this gallery</h2>
              <p className="head__sub">
                <SignedIn>Say what you saw.</SignedIn>
                <SignedOut>What other visitors said.</SignedOut>
              </p>
            </div>
            <NotesPanel albumId={album.id} initialNotes={notes} />
          </section>
        </NotesGate>
      )}
    </div>
  );
}

/** Shared by both album routes, which title themselves the same way. */
export async function albumMetadata(slug: string, page = 1) {
  const album = await getAlbum(slug);
  if (!album) return { title: "Not found" };
  const suffix = page > 1 ? ` — page ${page}` : "";
  return {
    title: `${album.title}${suffix}`,
    description: album.subtitle ?? undefined,
  };
}

import Link from "next/link";
import { ViewTransition } from "react";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion";
import { tileSizes } from "@/lib/images";
import { AlbumStrip } from "@/components/album-strip";
import { Plate } from "@/components/plate";
import { getAlbumsWithCovers } from "@/lib/gallery";
import { genres } from "@/lib/site";
import { SignedOut } from "@/components/signed-out";
import { plate } from "@/lib/format";

/**
 * Prerendered and revalidated, not rendered per request.
 *
 * Nothing here is per-visitor — the masthead asks about the reader on its own —
 * so rendering it for every arrival bought nothing and cost a cache: a page
 * Next treats as dynamic goes out with `no-store`, which forbids the CDN and
 * the browser alike from keeping it.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galleries",
  description: "Photographic galleries — sport, food, and unfiled work.",
};

export default async function WorkPage() {
  /* Five plates past each cover. They ride the same round trip — see
   * getAlbumsWithCovers — and they are the same files the home index asks
   * for, so a visitor arriving from / has them already. */
  const albums = await getAlbumsWithCovers(undefined, 5);
  const heldBack = albums.filter((a) => a.visibility === "members").length;

  return (
    <div className="page">
      <section className="page__intro">
        <h1 className="page__title">
          Work, <em>indexed</em>.
        </h1>
        <p className="fold-text__body">
          {albums.length === 0
            ? "Graduations, brand work, sport, food and events will be filed here."
            : `${albums.length} ${albums.length === 1 ? "gallery" : "galleries"}${
                heldBack > 0 ? `, ${heldBack} held back for signed-in visitors` : ""
              }.`}
        </p>
        {heldBack > 0 && (
          <SignedOut>
            <p>
              <Link className="link" href="/enter">
                Sign in to open them →
              </Link>
            </p>
          </SignedOut>
        )}
      </section>

      {/* Links, not a client-side filter. A genre is something to send someone,
          so it needs a URL — and these work before any JavaScript runs. */}
      {albums.length > 0 && (
        <nav className="page__pad" aria-label="Browse by genre">
          <div className="chips">
            {genres
              .filter((g) => albums.some((a) => a.genre === g.id))
              .map((g) => (
                <Link className="chip" key={g.id} href={`/work/genre/${g.id}`}>
                  {g.label} ({albums.filter((a) => a.genre === g.id).length})
                </Link>
              ))}
          </div>
        </nav>
      )}

      {albums.length === 0 ? (
        <section className="page__pad page__pad-b">
          <p className="notes__empty">Nothing filed yet.</p>
        </section>
      ) : (
        <div className="albums">
          {albums.map((album, i) => {
            const cover = album.cover;
            return (
              <Reveal as="article" className="album" key={album.id} index={i} kind="plate">
                <Link
                  className="album__media"
                  href={`/work/${album.slug}`}
                  style={
                    cover?.width && cover?.height
                      ? ({ "--tile-ratio": `${(cover.width / cover.height).toFixed(4)}` } as React.CSSProperties)
                      : undefined
                  }
                >
                  {/* M3 — the cover carries across the navigation.
                      docs/IDEAS-motion.md § 3.4, wanted since it was written
                      and deferred each time because the shared element had to
                      change aspect mid-flight. The pair is real now: this is
                      the album's cover and so is the plate that opens its
                      gallery. `share="morph"` with `default="none"` so only
                      this pair animates and only when it has a partner —
                      without the pair the page behaves exactly as before. */}
                  {cover?.url ? (
                    <ViewTransition
                      name={`cover-${album.slug}`}
                      share="morph"
                      default="none"
                    >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.url}
                      srcSet={cover.srcSet ?? undefined}
                      sizes={tileSizes(i)}
                      alt={cover.caption ?? album.title}
                      loading={i < 2 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                    </ViewTransition>
                  ) : (
                    <Plate no={plate(i)} label="no cover yet" />
                  )}
                  {/* design.md § 4: type on the photograph, not beside it. */}
                  <span className="album__on">
                    <span className="album__name">{album.title}</span>
                    <span className="album__year u-tabular">{album.year ?? "—"}</span>
                  </span>
                </Link>
                <AlbumStrip plates={album.plates} />
                {/* The heading stays in the document for structure and for
                    anyone reading by headings; the visible name is the one set
                    on the photograph above. */}
                <h2 className="album__title u-sr">
                  <Link href={`/work/${album.slug}`}>{album.title}</Link>
                </h2>
                {/* No subtitle renders nothing. It used to fall through to
                    the literal "unfiled" — internal filing language, printed
                    on the card a prospective client reads, and measured live
                    on "Hello There...", whose subtitle and place are both
                    null. A blank line is honest; that word is worse than
                    blank. See docs/PRD-the-archive-in-its-own-words.md § 3.1. */}
                {(album.subtitle ?? album.place) && (
                  <p className="album__sub">{album.subtitle ?? album.place}</p>
                )}
                {album.visibility === "members" && (
                  <span className="lock">◆ signed-in only</span>
                )}
              </Reveal>
            );
          })}
        </div>
      )}

    </div>
  );
}

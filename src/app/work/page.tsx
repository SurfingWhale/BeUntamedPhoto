import Link from "next/link";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion";
import { SIZES } from "@/lib/images";
import { Plate } from "@/components/plate";
import { getAlbumsWithCovers } from "@/lib/gallery";
import { genres } from "@/lib/site";
import { getViewer } from "@/lib/auth";
import { plate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galleries",
  description: "Photographic galleries — sport, food, and unfiled work.",
};

export default async function WorkPage() {
  const [albums, viewer] = await Promise.all([getAlbumsWithCovers(), getViewer()]);
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
        {!viewer && heldBack > 0 && (
          <p>
            <Link className="link" href="/enter">
              Sign in to open them →
            </Link>
          </p>
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
              <Reveal as="article" className="album" key={album.id} index={i}>
                <Link
                  className="album__media"
                  href={`/work/${album.slug}`}
                  style={
                    cover?.width && cover?.height
                      ? ({ "--tile-ratio": `${cover.width} / ${cover.height}` } as React.CSSProperties)
                      : undefined
                  }
                >
                  {cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      srcSet={cover.srcSet ?? undefined}
                      sizes={SIZES.tile}
                      alt={cover.caption ?? album.title}
                      loading={i < 2 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  ) : (
                    <Plate no={plate(i)} label="no cover yet" />
                  )}
                </Link>
                <div className="album__meta">
                  <h2 className="album__title">
                    <Link href={`/work/${album.slug}`}>{album.title}</Link>
                  </h2>
                  <span className="album__year u-tabular">{album.year ?? "—"}</span>
                </div>
                <p className="album__sub">
                  {album.subtitle ?? album.place ?? "unfiled"}
                </p>
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

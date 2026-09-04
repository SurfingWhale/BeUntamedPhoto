import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Commission } from "@/components/commission";
import { Reveal } from "@/components/motion";
import { Plate } from "@/components/plate";
import { getAlbumsWithCovers } from "@/lib/gallery";
import { getViewer } from "@/lib/auth";
import { plate } from "@/lib/format";
import { SIZES } from "@/lib/images";
import { genres, site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ genre: string }> };

function find(id: string) {
  return genres.find((g) => g.id === id);
}

/**
 * A page per body of work, so a genre is a link.
 *
 * The filter on the home page only helps someone already on the site. What
 * actually gets used is a URL that can be pasted into a WhatsApp message to
 * one client — /work/genre/graduation, with its own share card, rather than
 * "open my site and click the graduation filter".
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { genre } = await params;
  const g = find(genre);
  if (!g) return {};
  return {
    title: `${g.label} photography`,
    description: `${g.blurb} ${g.label} commissions by ${site.owner}.`,
    alternates: { canonical: `/work/genre/${g.id}` },
    openGraph: {
      title: `${g.label} photography by ${site.owner}`,
      description: g.blurb,
      url: `/work/genre/${g.id}`,
    },
  };
}

export default async function GenrePage({ params }: Params) {
  const { genre } = await params;
  const g = find(genre);
  if (!g) notFound();

  const [albums, viewer] = await Promise.all([
    getAlbumsWithCovers(g.id),
    getViewer(),
  ]);
  const heldBack = albums.filter((a) => a.visibility === "members").length;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">{g.label}</p>
        <h1 className="page__title">{g.label}.</h1>
        <p className="fold-text__body">{g.blurb}</p>
        <p className="fold-text__body">
          {albums.length === 0
            ? `No ${g.label.toLowerCase()} sets are filed yet — the rest of the archive is open.`
            : `${albums.length} ${albums.length === 1 ? "set" : "sets"}${
                heldBack > 0 ? `, ${heldBack} held back for signed-in visitors` : ""
              }. Commissions open — ${site.email}.`}
        </p>
        <p>
          <Link className="link" href="/work">
            ← Every gallery
          </Link>
        </p>
      </section>

      {albums.length === 0 ? (
        <section className="page__pad page__pad-b">
          <p className="notes__empty">Nothing filed here yet.</p>
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
                <p className="album__sub">{album.subtitle ?? album.place ?? "unfiled"}</p>
                {album.visibility === "members" && !viewer && (
                  <span className="lock">◆ signed-in only</span>
                )}
              </Reveal>
            );
          })}
        </div>
      )}

      <Commission genre={g.id} atGenre />
    </div>
  );
}

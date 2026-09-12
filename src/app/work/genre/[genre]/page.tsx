import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion";
import { Plate } from "@/components/plate";
import { getAlbumsWithCovers } from "@/lib/gallery";
import { SignedOut } from "@/components/signed-out";
import { plate } from "@/lib/format";
import { SIZES } from "@/lib/images";
import { elsewhere, genres, site } from "@/lib/site";

/**
 * Prerendered at build time, one page per genre, revalidated every five
 * minutes.
 *
 * This is the page meant to be pasted into a message to one client, so it is
 * also the page most likely to be opened cold on a phone. It used to be
 * `force-dynamic`, which meant every one of those arrivals waited on two
 * queries and got the answer back marked `no-store`. There are five genres and
 * they are known here, in code — so all five are built ahead.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return genres.map((g) => ({ genre: g.id }));
}

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
    description: `${g.blurb} ${g.label} commissions open.`,
    alternates: { canonical: `/work/genre/${g.id}` },
    openGraph: {
      // Set explicitly: this object replaces the layout's rather than merging
      // with it, so the site-wide type does not carry through.
      type: "website",
      siteName: site.name,
      title: `${g.label} photography · ${site.name}`,
      description: g.blurb,
      url: `/work/genre/${g.id}`,
    },
  };
}

export default async function GenrePage({ params }: Params) {
  const { genre } = await params;
  const g = find(genre);
  if (!g) notFound();

  const albums = await getAlbumsWithCovers(g.id);
  const heldBack = albums.filter((a) => a.visibility === "members").length;

  /* Two of the five genres this site sells have no sets filed here, because
   * their work lives on its own satellite: Sport at UNTMD Sports, Food at
   * VisuFavor. Until this change, a client who came looking for either read
   * "No food sets are filed yet" and "Nothing filed here yet" on the same
   * page, and the only way onward was back to `/work`. That is a dead end
   * on the page most likely to be pasted into a message to one client.
   *
   * `elsewhere` already carried a `lane` for each satellite — "Sport" and
   * "Food", matching these labels exactly — so the data to do this has been
   * here all along and the page simply never read it. It still does not
   * invent work: it says where the work is. */
  const lane = elsewhere.find((e) => e.lane === g.label) ?? null;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">{g.label}</p>
        <h1 className="page__title">{g.label}.</h1>
        <p className="fold-text__body">{g.blurb}</p>
        <p className="fold-text__body">
          {albums.length === 0
            ? lane
              ? `The ${g.label.toLowerCase()} work has its own portfolio. Commissions still come here — ${site.email}.`
              : `No ${g.label.toLowerCase()} sets are filed yet — the rest of the archive is open.`
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

      {albums.length === 0 && lane ? (
        /* A client who came looking for this genre gets sent to the work,
           not told there is none of it. See the note above `lane`. */
        <section className="fold-text">
          <div className="elsewhere">
            <a
              className="elsewhere__row"
              href={lane.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="elsewhere__name">{lane.name}</span>
              <span className="elsewhere__what">{lane.what}</span>
              <span className="elsewhere__go">
                {lane.go} {"\u2197\uFE0E"}
              </span>
            </a>
          </div>
        </section>
      ) : albums.length === 0 ? (
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
                      ? ({ "--tile-ratio": `${(cover.width / cover.height).toFixed(4)}` } as React.CSSProperties)
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
                {album.visibility === "members" && (
                  <SignedOut>
                    <span className="lock">◆ signed-in only</span>
                  </SignedOut>
                )}
              </Reveal>
            );
          })}
        </div>
      )}

    </div>
  );
}

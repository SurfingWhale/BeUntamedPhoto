import Link from "next/link";

import { IndexFilter } from "@/components/index-filter";
import { Reveal } from "@/components/motion";
import { SIZES } from "@/lib/images";
import { PhotoFold } from "@/components/photo-fold";
import { Plate } from "@/components/plate";
import { Ticker } from "@/components/ticker";
import { getAlbumsWithCovers, getFeatured } from "@/lib/gallery";
import { plate } from "@/lib/format";
import { elsewhere, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const FALLBACK_LABELS = ["the opening frame", "between assignments"];

/* Composition studied from the reference layout (design.md § 3.6):
 * an opening zone that is mostly empty, a full-bleed photograph whose edges
 * land on lattice rows, then a lower zone of huge light display type against
 * a narrow justified column, with the marks placed in the margins.
 * White carries ~85% of the page; green is the photograph and one tag. */
export default async function HomePage() {
  // One wave, not a chain: covers arrive with their albums now, so nothing
  // here waits on anything else.
  const [featured, albums] = await Promise.all([getFeatured(2), getAlbumsWithCovers()]);
  /* Six, not three. The section is there so someone can scroll a quick sense
   * of the range of work; three tiles on a twelve-column field showed one
   * genre and stopped. The grid already has spans for six. */
  const shown = albums.slice(0, 6);
  const year = new Date().getUTCFullYear();
  const held = albums.filter((a) => a.visibility === "members").length;

  /* Ticker content is real: counts and lanes, nothing invented. */
  const tickerItems = [
    `${site.name}®`,
    `${albums.length} ${albums.length === 1 ? "gallery" : "galleries"} filed`,
    held > 0 ? `${held} held back` : "open archive",
    "01 food · visufavor",
    "02 sport · untmd",
    "03 events & everything else",
    `dispatch ${year}`,
  ];

  return (
    <div className="page">
      {/* ---- opening zone · mostly empty, marks placed in the blank cells --- */}
      <section className="open">
        <Reveal className="open__label" index={0}>
          <p className="u-mono">
            visual
            <br />
            archive
          </p>
          <p className="open__no">{`2K${String(year).slice(2)}`}</p>
          <p className="label-wide">frames not feeds</p>
        </Reveal>

        <span className="mark mark--thin open__arrow" aria-hidden="true">
          ←
        </span>

        <Reveal className="open__swatches" index={2}>
          <div className="swatches" aria-hidden="true">
            <span className="swatch" style={{ background: "var(--color-ink)" }} />
            <span className="swatch" style={{ background: "var(--color-accent-deep)" }} />
            <span className="swatch" style={{ background: "var(--color-paper-dark)" }} />
            <span className="swatch" style={{ background: "var(--color-accent)" }} />
          </div>
          <p className="u-mono">.colour picture</p>
        </Reveal>
      </section>

      <Ticker items={tickerItems} />

      {/* ---- the photograph · full bleed, edges on lattice rows ------------ */}
      <div className="plinth">
        <PhotoFold
          photo={featured[0]}
          index={0}
          size="tall"
          priority
          fallbackLabel={FALLBACK_LABELS[0]}
        />
      </div>

      {/* ---- lower zone · display type against a narrow justified column --- */}
      <section className="story">
        <Reveal className="story__head" index={0}>
          <h1 className="story__title">
            the half-second
            <br />
            before it is
            <br />
            over .
          </h1>
          <p className="tag">
            {albums.length.toString().padStart(2, "0")} filed
          </p>
          <p className="label-wide">available for commissions</p>
        </Reveal>

        <span className="mark mark--bold story__arrow" aria-hidden="true">
          ↗
        </span>
        <span className="mark mark--thin story__foot" aria-hidden="true">
          ∟
        </span>

        <Reveal className="story__col" index={1}>
          <span className="bracket bracket--tr" aria-hidden="true">
            ⌐
          </span>
          <span className="ghost" aria-hidden="true">
            {String(year).slice(2)}
          </span>

          <div className="story__pair">
            <p className="story__no">01</p>
            <p className="story__gloss">Show up early,</p>
            <p className="story__no">02</p>
            <p className="story__gloss">wait for the real one.</p>
          </div>

          <p className="story__body">
            I&rsquo;m {site.owner}. I shoot graduations, brand work, sport, food
            and events. Most of it is patience — holding a frame until the
            arranged version of a moment drops away and the honest one shows up.
          </p>
          <p className="story__body">
            Every genre is booked from here. Two of them have their own deeper
            portfolios — UNTMD Sports and VisuFavor — but the brief comes to the
            same inbox:{" "}
            <a className="link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="label-wide story__by">archive by {site.owner}</p>
        </Reveal>
      </section>

      <div className="rail">
        <span>
          <span className="rail__no">01 →</span> Selected galleries
        </span>
        <span>[{albums.length} filed]</span>
      </div>

      {/* ---- Portfolio Grid · three tiles, irregular spans ------------------ */}
      {shown.length > 0 && (
        <section className="grid-band plot">
          {/* Same pinning as the index below: the heading holds while the tiles
              run under it, so the section you are in stays named. The wrapper
              is what gives the sticky child room to travel. */}
          <div className="index-wrap">
            <div className="index-sticky">
              <div className="index-head">
                <h2 className="head__title">Recent work</h2>
                <p className="index-count">
                  ( {albums.length} filed )
                </p>
              </div>
            </div>

            <div className="albums albums--few">
            {shown.map((album, i) => {
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
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ) : (
                      <Plate no={plate(i)} label="no cover yet" />
                    )}
                  </Link>
                  <div className="album__meta">
                    <h3 className="album__title">
                      <Link href={`/work/${album.slug}`}>{album.title}</Link>
                    </h3>
                    <span className="album__year u-tabular">{album.year ?? "—"}</span>
                  </div>
                  <p className="album__sub">{album.subtitle ?? album.place ?? "unfiled"}</p>
                  {album.visibility === "members" && (
                    <span className="lock">◆ signed-in only</span>
                  )}
                </Reveal>
              );
            })}
            </div>
          </div>

          <p>
            <Link className="link" href="/work">
              Open the full index →
            </Link>
          </p>
        </section>
      )}

      <div className="rail">
        <span>
          <span className="rail__no">02 →</span> Project index
        </span>
        <span>[choose by lane]</span>
      </div>

      {/* ---- project index · counter, category chips, numbered rows -------- */}
      <section className="grid-band">
        <IndexFilter albums={albums} />
      </section>

      <div className="rail">
        <span>
          <span className="rail__no">03 →</span> Lanes
        </span>
        <span>[food · sport · everything else]</span>
      </div>

      {/* ---- lane index · white, hairlines only. No slab. ------------------- */}
      <section className="band band--dark plot">
        <div className="elsewhere">
          {elsewhere.map((place, i) => (
            <Reveal
              as="a"
              key={place.href}
              index={i}
              className="elsewhere__row"
              href={place.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="elsewhere__name">{place.name}</span>
              <span className="elsewhere__what">{place.what}</span>
              <span className="elsewhere__go">{place.go} ↗</span>
            </Reveal>
          ))}
          <Link className="elsewhere__row" href="/work">
            <span className="elsewhere__name">UNTAMED</span>
            <span className="elsewhere__what">
              Graduations, brand work and events — the full archive, filed by genre.
            </span>
            <span className="elsewhere__go">this site →</span>
          </Link>
        </div>
      </section>

      <div className="plinth">
        <PhotoFold photo={featured[1]} index={1} fallbackLabel={FALLBACK_LABELS[1]} />
      </div>
    </div>
  );
}

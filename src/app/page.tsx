import { IndexFilter } from "@/components/index-filter";
import { Reveal } from "@/components/motion";
import { Lanes } from "@/components/lanes";
import { PhotoFold } from "@/components/photo-fold";
import { Ticker } from "@/components/ticker";
import { getAlbumsWithCovers, getFeatured } from "@/lib/gallery";
import { site } from "@/lib/site";

/**
 * Prerendered and revalidated, not rendered per request.
 *
 * Nothing here is per-visitor — the masthead asks about the reader on its own —
 * so rendering it for every arrival bought nothing and cost a cache: a page
 * Next treats as dynamic goes out with `no-store`, which forbids the CDN and
 * the browser alike from keeping it.
 */
export const revalidate = 300;

const FALLBACK_LABELS = ["the opening frame", "between assignments"];

/* One index, not two.
 *
 * This page used to render albums.slice(0, 6) as a cover grid under "Recent
 * work" and then all seven again as a numbered list under "The index" — 2162px
 * of a 6569px page, measured, listing the same galleries twice in two visual
 * languages. Six titles appeared twice in the rendered DOM. The grid is gone
 * and the list carries the covers, so the page is shorter and still shows
 * photographs, which § 10 requires of a content page.
 *
 * Composition studied from the reference layout (design.md § 3.6):
 * an opening zone that is mostly empty, a full-bleed photograph whose edges
 * land on lattice rows, then a lower zone of huge light display type against
 * a narrow justified column, with the marks placed in the margins.
 * White carries ~85% of the page; green is the photograph and one tag. */
export default async function HomePage() {
  // One wave, not a chain: covers arrive with their albums now, so nothing
  // here waits on anything else.
  const [featured, albums] = await Promise.all([getFeatured(2), getAlbumsWithCovers()]);
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

        {/* Variation selector, not a bare arrow: U+2197 has an emoji
            presentation and rendered as a blue glyph on a phone. */}
        <span className="mark mark--bold story__arrow" aria-hidden="true">
          {"\u2197\uFE0E"}
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
            I shoot graduations, brand work, sport, food and events. Most of
            it is patience — holding a frame until the
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
          <p className="label-wide story__by">archive by {site.byline}</p>
        </Reveal>
      </section>

      <div className="rail">
        <span>
          <span className="rail__no">01 →</span> The index
        </span>
        <span>[choose by lane]</span>
      </div>

      {/* ---- project index · counter, category chips, numbered rows -------- */}
      <section className="grid-band">
        <IndexFilter albums={albums} />
      </section>

      <div className="rail">
        <span>
          <span className="rail__no">02 →</span> Lanes
        </span>
        <span>[food · sport · everything else]</span>
      </div>

      {/* ---- lane index · white, hairlines only. No slab. ------------------- */}
      <Lanes
        archiveBanner={
          featured[0]
            ? {
                url: featured[0].url,
                srcSet: featured[0].srcSet,
                caption: featured[0].caption,
                width: featured[0].width,
                height: featured[0].height,
              }
            : null
        }
      />

      <div className="plinth">
        <PhotoFold photo={featured[1]} index={1} fallbackLabel={FALLBACK_LABELS[1]} />
      </div>
    </div>
  );
}

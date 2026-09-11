import { IndexFilter } from "@/components/index-filter";
import { Reveal } from "@/components/motion";
import { Lanes } from "@/components/lanes";
import { Hero } from "@/components/hero";
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

/* One label, for the one PhotoFold left on this page. The hero draws its own
 * placeholder ground and needs none. */
const CLOSING_FALLBACK = "between assignments";

/* One index, not two.
 *
 * This page used to render albums.slice(0, 6) as a cover grid under "Recent
 * work" and then all seven again as a numbered list under "The index" — 2162px
 * of a 6569px page, measured, listing the same galleries twice in two visual
 * languages. Six titles appeared twice in the rendered DOM. The grid is gone
 * and the list carries the covers, so the page is shorter and still shows
 * photographs, which § 10 requires of a content page.
 *
 * Composition, in the order it draws (design.md § 4):
 *
 *   hero · ticker · opening zone · statement · label + gallery reel ·
 *   label + lanes reel · closing plate
 *
 * The hero is new and the order around it changed. This page used to open on
 * the masthead, then a screen of mostly-empty typography, then the ticker,
 * then its first photograph — so someone arriving from a shared link met type
 * before they met any work, which is the opposite of the reference. The
 * photograph is first now, with the statement set on it in light type, and
 * the plinth that used to hold that same plate is gone rather than repeating
 * it a screen later.
 *
 * The typographic opening zone survives, below the ticker, as an interstitial
 * rather than as the front door. Its "frames not feeds" label went with it:
 * that line is the hero's now, and one page does not say it twice. */
export default async function HomePage() {
  // One wave, not a chain: covers arrive with their albums now, so nothing
  // here waits on anything else.
  /* Three plates, not two: the hero takes the first, the lane banner the
   * second and the closing fold the third, so no photograph appears twice on
   * the page. Fewer than three in the archive and the tail degrades — the
   * banner falls back to the hero's plate, four screens away, and PhotoFold
   * draws its numbered Plate placeholder. */
  const [featured, albums] = await Promise.all([getFeatured(3), getAlbumsWithCovers()]);
  const banner = featured[1] ?? featured[0];
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
      {/* ---- the hero · full bleed, the statement set on it in light type -- */}
      <Hero photo={featured[0]} />

      <Ticker items={tickerItems} />

      {/* ---- opening zone · mostly empty, marks placed in the blank cells --- */}
      <section className="open">
        <Reveal className="open__label" index={0}>
          <p className="u-mono">
            visual
            <br />
            archive
          </p>
          <p className="open__no">{`2K${String(year).slice(2)}`}</p>
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

      {/* ---- lower zone · display type against a narrow justified column --- */}
      <section className="story">
        <Reveal className="story__head" index={0}>
          <h2 className="story__title">
            the half-second
            <br />
            before it is
            <br />
            over .
          </h2>
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
        <span className="rail__mark" aria-hidden="true">{"\u2739"}</span>
        <span>The index</span>
      </div>

      {/* ---- project index · counter, category chips, numbered rows -------- */}
      <section className="grid-band">
        <IndexFilter albums={albums} />
      </section>

      <div className="rail">
        <span className="rail__mark" aria-hidden="true">{"\u2739"}</span>
        <span>Three sites, one practice</span>
      </div>

      {/* ---- lane index · white, hairlines only. No slab. ------------------- */}
      <Lanes
        archiveBanner={
          banner
            ? {
                url: banner.url,
                srcSet: banner.srcSet,
                caption: banner.caption,
                width: banner.width,
                height: banner.height,
              }
            : null
        }
      />

      <div className="plinth">
        <PhotoFold photo={featured[2]} index={2} fallbackLabel={CLOSING_FALLBACK} />
      </div>
    </div>
  );
}

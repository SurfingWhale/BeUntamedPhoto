import Link from "next/link";

import { IndexFilter } from "@/components/index-filter";
import { Reveal } from "@/components/motion";
import { Lanes } from "@/components/lanes";
import { Hero } from "@/components/hero";
import { Deck } from "@/components/deck";
import { PhotoFold } from "@/components/photo-fold";
import { SectionHead } from "@/components/section-head";
import { Ticker } from "@/components/ticker";
import { getAlbumsWithCovers, getFeatured } from "@/lib/gallery";
import {
  DECK_LEAD_WIDTH,
  DECK_SIDE_WIDTH,
  PAIR_MAX_WIDTH,
  SIZES,
  publicSrc,
  trimSrcSet,
} from "@/lib/images";
import { plate as plate2 } from "@/lib/format";
import { elsewhere, genres, site } from "@/lib/site";

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
 *   hero · ticker · statement · photographic band · the index, as a grid ·
 *   opening zone · story · label + lanes reel · closing plate
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
  /* Three plates past each cover, for the contact strip on every index card.
   * The extra rows ride the same round trip — see getAlbumsWithCovers — and
   * only this page asks for them, because only this page draws them. */
  const [featured, albums] = await Promise.all([
    getFeatured(6),
    getAlbumsWithCovers(undefined, 3),
  ]);
  /* Six featured plates now: the hero, the index band, the pair in the opening
   * zone, the lane banner and the closing fold, so no photograph appears twice
   * on the page. Each falls back to the one before it, so a thin archive
   * degrades rather than breaking — fewer than six and the pair reuses earlier
   * plates and PhotoFold draws its numbered placeholder.
   *
   * FEATURED_SLOTS and the check constraint in add-featured-rank.sql still
   * name four, because those are the four the owner picks by hand. The pair
   * takes whatever the archive returns after them, which is what every slot
   * did before that migration was written and is still un-run. Worth two more
   * ranks later; not worth blocking this on a migration. */
  const bandPlate = featured[1] ?? featured[0];
  const pairA = featured[4] ?? featured[1] ?? featured[0];
  const pairB = featured[5] ?? featured[2] ?? featured[0];
  const banner = featured[2] ?? featured[0];
  const closing = featured[3] ?? featured[1] ?? featured[0];
  const year = new Date().getUTCFullYear();

  /* One card per lane that has work in it, each carrying three photographs
   * from that lane.
   *
   * Deliberately lanes and not galleries. The index below already lists all
   * nine galleries with a contact strip each, and this page has printed one set
   * twice before — 2162px of a 6569px page, measured. A lane card answers a
   * different question: not "which galleries exist" but "what does a food
   * shoot from here actually look like", which is the one a client has before
   * they commission a lane they have never seen.
   *
   * Covers first, then the plates behind them, because a cover is the frame
   * the owner chose to front that gallery with. Lanes with nothing filed are
   * absent rather than empty — Food and Sport are both 0 today
   * (pending-task.md § 3), and a card promising a lane the archive cannot show
   * is worse than no card. */
  /* One panel per lane that has work in it, each carrying three photographs
   * from that lane.
   *
   * Deliberately lanes and not galleries. The index below already lists all
   * nine galleries with a contact strip each, and this page has printed one set
   * twice before — 2162px of a 6569px page, measured. A lane panel answers a
   * different question: not "which galleries exist" but "what does a food
   * shoot from here actually look like", which is the one a client has before
   * they commission a lane they have never seen.
   *
   * Covers first, then the plates behind them, because a cover is the frame
   * the owner chose to front that gallery with. Lanes with nothing filed are
   * absent rather than empty — Food and Sport are both 0 today
   * (pending-task.md § 3), and a panel promising a lane the archive cannot
   * show is worse than no panel.
   *
   * Two widths, by position rather than by breakpoint. The first frame is the
   * panel's lead and paints up to 419px; the two behind it paint up to 279.
   * Both are asked for directly at a measured ceiling — see DECK_LEAD_WIDTH.
   * Cover and plate go through the same builder now: the version before this
   * one built a wide source for the cover and reused the 288w strip file for
   * the plates, so one frame in three was sharp. */
  const laneCards = genres
    .map((g) => {
      const inLane = albums.filter((a) => a.genre === g.id);
      const plates = [
        ...inLane
          .map((a) => a.cover)
          .filter((c) => c?.url && c.bucket === "gallery")
          .map((c) => ({
            id: c!.id,
            path: c!.path,
            width: c!.width,
            height: c!.height,
          })),
        ...inLane.flatMap((a) => a.plates),
      ].slice(0, 3);
      const frames = plates.map((f, i) => ({
        id: f.id,
        src: publicSrc(
          "gallery",
          f.path,
          i === 0 ? DECK_LEAD_WIDTH : DECK_SIDE_WIDTH,
          f.width,
          f.height,
        ),
      }));
      return { id: g.id, label: g.label, blurb: g.blurb, frames, count: inLane.length };
    })
    .filter((l) => l.frames.length === 3);
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
      <Hero photo={featured[0]} thumbs={albums.slice(0, 4)} />

      <Ticker items={tickerItems} />

      {/* ---- the statement · one paragraph, large, straight under the ticker
           The Nomvnt reference puts its "About Us" here and nowhere else: an
           eyebrow tag, then a single large sentence-case paragraph, then a
           smaller supporting line. It is the only text between the hero and
           the product grids, and it is what this page was missing — it went
           from the ticker straight into the index. The long editorial block
           stays where it is, below the galleries. */}
      {/* ---- the deck · one card per lane, three photographs each ----------
           docs/reference/nomvnt-page.jpg. Cards that show what a lane looks
           like, swiped rather than scrolled, with the next one standing
           behind the one in front so the set reads as a deck.

           Lanes, not galleries, on purpose: the index below lists all nine
           galleries and this page has printed one set twice before. A lane
           card answers the other question — what a food shoot from here
           actually looks like — which is the one a client has before they
           commission a lane they have not seen. */}
      {laneCards.length > 0 && (
        <section className="deck-band">
          <SectionHead
            className="deck-band__head"
            eyebrow="By lane"
            lead="Three frames,"
            tail={
              <>
                <em>each</em> way of working.
              </>
            }
          />
          <Deck lanes={laneCards} label="Lanes" />
        </section>
      )}

      {/* ---- the statement · a landscape card, the type set in the middle --
           It was a full-bleed block of type on the page ground. In a card it
           has edges to be centred inside, which is what makes a paragraph
           this size read as composed rather than as a paragraph that happens
           to be large. The reference's own About block is the widest single
           thing on its page and this is the same move held to a card. */}
      <Reveal as="section" className="statement" index={0}>
        <div className="statement__card">
          <p className="statement__eyebrow">
            <span aria-hidden="true">{"\u2739"}</span> About
          </p>
          <p className="statement__lead">
            I shoot graduations, brand work, sport, food and events. Most of it
            is patience — holding a frame until the arranged version of a
            moment drops away and the honest one shows up.
          </p>
          <p className="statement__sub">
            Every genre is booked from here. Two of them have their own deeper
            portfolios — UNTMD Sports and VisuFavor — but the brief comes to
            the same inbox:{" "}
            <a className="link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </div>
      </Reveal>

      {/* ---- project index · opens on a photograph, chips under it --------
           Moved above the editorial block. Measured on the live page before
           this: the first photograph landed at 0.17 screens and the second at
           2.73, with 1.7 screens of typography between them, on a site whose
           only real evidence is photographs. The research on the first screen
           puts the target at photograph two above 1.5 screens and six inside
           the first three. See docs/RESEARCH-the-first-screen.md § 4.1. */}
      <section className="grid-band">
        <IndexFilter albums={albums} band={bandPlate} />
      </section>

      {/* ---- featured · the reference's section 4, built as a section -----
           docs/reference/nomvnt-page.jpg. Eyebrow, a two-line heading with
           the second line stepped in and one word marked, a supporting line,
           then two cards — the first standing on a lime block — and an action
           at the trailing edge. That is the whole shape of its Featured
           Collection, and the first pass at this put two plates into the
           typographic zone without any of it: no opening, no card names, no
           foot. A pair of photographs is not a section.

           The zone's own voice is kept rather than replaced. "Visual archive"
           becomes the eyebrow it always read like, and `2K26` stays as the
           graphic numeral — the reference has no equivalent, but this archive
           does and it is the one thing here that is not borrowed.

           What the copy must not claim: these two are *not* hand-picked.
           featured_rank exists for that and its migration is still un-run
           (pending-task.md § 9), so the plates arrive in the archive's own
           order. The heading says "out of the file", which is true either
           way. */}
      <section className="open u-lattice">
        <SectionHead
          className="open__head"
          eyebrow="Visual archive"
          lead="Out of the file,"
          tail={
            <>
              <em>two</em> frames.
            </>
          }
          sub="No brief attached and no set around them — two plates at the size this page can give them. Everything with a job behind it is filed by lane below."
        />

        <p className="open__no" aria-hidden="true">{`2K${String(year).slice(2)}`}</p>

        <span className="mark mark--thin open__arrow" aria-hidden="true">
          ←
        </span>

        {/* Two cards, and they are cards now: the plate, its own name, and a
            quiet line under it — the reference's "Olive Parade Outwear /
            Classic, Oversized Fit". A figure with a plate number and nothing
            else was a contact sheet. */}
        <Reveal className="open__pair" index={2}>
          {[pairA, pairB].map((plate, i) =>
            plate?.url ? (
              <figure className="pair" key={plate.id} data-lime={i === 0 ? "true" : undefined}>
                {/* Storage URLs are remote — a plain <img>, as everywhere. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plate.url}
                  srcSet={trimSrcSet(plate.srcSet, PAIR_MAX_WIDTH)}
                  sizes={SIZES.pair}
                  alt={plate.caption ?? `Plate ${plate2(i + 4)}`}
                  width={plate.width ?? undefined}
                  height={plate.height ?? undefined}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="pair__cap">
                  <span className="pair__name">
                    <span className="pair__no">[{plate2(i + 4)}]</span>{" "}
                    {plate.caption ?? `Plate ${plate2(i + 4)}`}
                  </span>
                  {plate.place ? (
                    <span className="pair__meta">{plate.place}</span>
                  ) : null}
                </figcaption>
              </figure>
            ) : null,
          )}
        </Reveal>

        {/* The action at the trailing edge, where the reference puts its
            `( 24 Products )` and its arrows. A link rather than arrows:
            arrows page a carousel and there is nothing here to page. The
            count is not repeated either — the index below already prints it,
            and this page has listed one set twice before. */}
        <p className="open__foot">
          <Link className="link" href="/work">
            All galleries →
          </Link>
        </p>
      </section>

      {/* ---- lower zone · display type against a narrow justified column --- */}
      <section className="story u-lattice">
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

          {/* The two paragraphs that were here now open the page as the
              statement above the galleries. Saying them twice on one page was
              the fault this section used to have with the old index. */}
          <p className="story__body">
            Show up early enough that nobody is performing yet, and stay long
            enough that they forget the camera is there. Everything else is
            timing.
          </p>
          <p className="label-wide story__by">archive by {site.byline}</p>
        </Reveal>
      </section>

      {/* The lanes' opening. "one" is the highlighted word: the whole point of
           this section is that three addresses are not three photographers,
           and that is the word carrying it. Counted and named from the
           `elsewhere` data rather than written out, so adding a lane cannot
           leave the heading claiming three. */}
      <SectionHead
        className="section-head--band"
        eyebrow="Elsewhere"
        lead={`${elsewhere.length + 1} sites,`}
        tail={
          <>
            <em>one</em> practice.
          </>
        }
        sub={`${elsewhere
          .map((e) => `${e.name} for ${e.lane.toLowerCase()}`)
          .join(", ")} — both shot from here. This archive is everything else.`}
      />

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
        <PhotoFold photo={closing} index={3} fallbackLabel={CLOSING_FALLBACK} />
      </div>
    </div>
  );
}

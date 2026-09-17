"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type LaneCard = {
  id: string;
  label: string;
  blurb: string;
  count: number;
  /** Three frames. The first is the panel's lead and is asked for larger. */
  frames: { id: string; src: string }[];
};

/**
 * The lane deck: one full-viewport panel per lane, swiped.
 *
 * Twice now this has been a row of cards, and twice that was the fault. First
 * three cards at `min(84%, 29rem)` came to about 1400px, so at 1440 all three
 * fit and the section read as a flat three-up grid. Widening the card and
 * adding arrows fixed the wide end and left the shape: on a phone it was still
 * a bordered box holding three 98px photographs in three equal columns —
 * "terlalu monoton dan flat karena lu cuma kasih tiga kotak dan gridnya
 * terlalu sempit. harusnya fulll kaya satu panel ajah jadinya user bisa
 * swipe."
 *
 * So the unit is a panel and not a card. Each one is the full width of the
 * scroller with the page gutter inside it rather than around it, and the three
 * photographs are one composition — a tall lead frame beside two stacked
 * behind it — instead of three equal thirds. At 390 the lead paints 208px
 * where it painted 98, and the panel is about a screen tall, which is what
 * makes it a panel: you swipe from one lane to the next rather than scanning
 * a row.
 *
 * Nothing is lost at the wide end. Above 48rem the panel splits in two, type
 * on the leading side and the frames on the trailing one, and the frames stop
 * growing at `calc(var(--module) * 6)` so the lead has a ceiling at every
 * viewport — which is what lets `DECK_LEAD_WIDTH` be a single measured file
 * instead of a `<picture>` with a media source.
 *
 * The scroller stays a scroller. Swipe, trackpad, shift-wheel and keyboard all
 * work; the arrows are an addition, because a carousel whose only control is a
 * pair of buttons is worse on a phone than the swipe it took away. `scrollBy`
 * one panel, read off the DOM rather than assumed — a panel is the scroller's
 * own width, so this stays right at any viewport.
 */
export function Deck({ lanes, label }: { lanes: LaneCard[]; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    /* A 1px tolerance: fractional scroll positions mean scrollLeft rarely
     * lands exactly on 0 or on the maximum, and an arrow that never enables
     * is worse than no arrow. */
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const step = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const panel = el.querySelector<HTMLElement>(".deck__card");
    const by = panel ? panel.getBoundingClientRect().width : el.clientWidth;
    el.scrollBy({ left: by * dir, behavior: "smooth" });
  };

  const total = String(lanes.length).padStart(2, "0");

  return (
    <>
      <div className="deck" aria-label={label} ref={ref}>
        {lanes.map((lane, i) => (
          <Link className="deck__card" key={lane.id} href={`/work/genre/${lane.id}`}>
            <span className="deck__panel">
              {/* Decorative: the panel is one link with one name, and three
                  more photographs inside it that each announced themselves
                  would read the lane out four times. */}
              <span className="deck__frames" aria-hidden="true">
                {lane.frames.map((f, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={f.id}
                    className={j === 0 ? "deck__lead" : undefined}
                    src={f.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </span>

              <span className="deck__text">
                {/* Which panel of how many, since one panel fills the
                    scroller and no sliver of the next one is visible to say
                    there is more. The dots and the arrows say the same thing;
                    this says it where the reader is already looking. */}
                <span className="deck__no u-tabular">
                  {String(i + 1).padStart(2, "0")} / {total}
                </span>
                <span className="deck__name">{lane.label}</span>
                <span className="deck__what">{lane.blurb}</span>
                <span className="deck__meta">
                  {lane.count} {lane.count === 1 ? "gallery" : "galleries"}{" "}
                  {"↗︎"}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Count on the leading edge and the arrows on the trailing one, which
          is where the reference puts its "( 24 Products )" and its ← →. */}
      <div className="deck__foot">
        <p className="deck__count">
          ( {lanes.length} {lanes.length === 1 ? "lane" : "lanes"} )
        </p>
        <div className="deck__nav">
          <button
            type="button"
            className="deck__arrow"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous lane"
          >
            {"←"}
          </button>
          <button
            type="button"
            className="deck__arrow"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Next lane"
          >
            {"→"}
          </button>
        </div>
      </div>
    </>
  );
}

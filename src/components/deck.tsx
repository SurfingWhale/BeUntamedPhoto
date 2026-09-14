"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CARD_THUMB_WIDTH } from "@/lib/images";

export type LaneCard = {
  id: string;
  label: string;
  blurb: string;
  count: number;
  frames: { id: string; src: string; srcWide: string }[];
};

/**
 * The lane deck, with its own arrows.
 *
 * It was already a scroll-snap reel, and on a phone it swiped correctly. The
 * fault was at the wide end: three cards at `min(84%, 29rem)` come to about
 * 1400px, so at 1440 all three simply fit and the section read as a flat
 * three-up grid of small cards with three small photographs in each. The
 * reference does not do that — its Featured row shows two large cards and
 * moves between them with `←` `→` at the foot, beside a count.
 *
 * So the card gets wider above 60rem and the arrows exist to reach the rest.
 * The scroller stays a scroller: swipe, trackpad, shift-wheel and keyboard all
 * still work, and the buttons are an addition rather than a replacement — a
 * carousel whose only control is a pair of buttons is worse on a phone than
 * the swipe it took away.
 *
 * `scrollBy` one card plus one gap, read off the DOM rather than assumed,
 * because the card width is a clamp and changes with the viewport.
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
    const card = el.querySelector<HTMLElement>(".deck__card");
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const by = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: by * dir, behavior: "smooth" });
  };

  return (
    <>
      <div className="deck" aria-label={label} ref={ref}>
        {lanes.map((lane) => (
          <Link className="deck__card" key={lane.id} href={`/work/genre/${lane.id}`}>
            <span className="deck__frames" aria-hidden="true">
              {lane.frames.map((f) => (
                <picture key={f.id}>
                  {/* Viewport, not device pixels — see DECK_FRAME_WIDE. */}
                  <source media="(min-width: 60rem)" srcSet={f.srcWide} />
                  {/* No eslint-disable needed: the rule does not fire on an
                      <img> inside a <picture>, which is the one place Next's
                      own component cannot be used anyway. */}
                  <img
                    src={f.src}
                    alt=""
                    width={CARD_THUMB_WIDTH}
                    height={CARD_THUMB_WIDTH}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              ))}
            </span>
            <span className="deck__name">{lane.label}</span>
            <span className="deck__what">{lane.blurb}</span>
            <span className="deck__meta">
              {lane.count} {lane.count === 1 ? "gallery" : "galleries"} {"↗︎"}
            </span>
          </Link>
        ))}
      </div>

      {/* Count on the left, arrows on the right — the reference's own foot for
          this section. Hidden from assistive tech: the deck is already a
          labelled scroll region and these move it rather than adding
          anything to it. */}
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

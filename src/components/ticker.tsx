"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The running strip. Movement comes from real archive metadata — gallery
 * counts, lane names, the year — never invented sale copy.
 *
 * WCAG 2.2.2: content that moves automatically for more than five seconds
 * needs a pause control available to everyone, not only to people who have
 * set prefers-reduced-motion. The strip also pauses on hover and on keyboard
 * focus so a reader can finish a line.
 */
export function Ticker({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  /* Held separately from `paused`, which belongs to the reader: the button
     must keep saying what the reader chose, not what the page decided. */
  const [yielding, setYielding] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  /* docs/IDEAS-motion.md § 3.5 — the strip yields to the work.
   *
   * A marquee running beside a plate is ornament competing with the
   * photograph, which is the one thing design.md § 10 rules out. It stops
   * while any large photograph is on screen and runs again when none is.
   *
   * Observing the plates rather than the strip, because the strip is at the
   * top of the page and the plates are what the reader is looking at. */
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const plates = document.querySelectorAll(".hero__img, .plinth .fold-photo__img, .index-band__img");
    if (!plates.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setYielding(seen.size > 0);
      },
      { threshold: 0.35 },
    );
    plates.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  if (items.length === 0) return null;

  const track = (dup: boolean) => (
    <div className="ticker__track" aria-hidden={dup || undefined}>
      {items.map((item, i) => (
        <span className="ticker__item" key={`${item}-${i}`}>
          <span className="ticker__dot" aria-hidden="true" />
          <span>{item}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="ticker"
      ref={ref}
      data-paused={paused || yielding ? "true" : undefined}
    >
      <div className="ticker__rail">
        {track(false)}
        {track(true)}
      </div>
      {/* The label alone carries the state. Pairing a swapping label with
          aria-pressed made screen readers announce "Pause, not pressed" and
          then "Play, pressed" — the name and the state disagreeing. */}
      <button
        type="button"
        className="ticker__toggle"
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? "Play" : "Pause"}
        <span className="u-sr"> the archive strip</span>
      </button>
    </div>
  );
}

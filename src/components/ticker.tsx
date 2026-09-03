"use client";

import { useState } from "react";

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
    <div className="ticker" data-paused={paused ? "true" : undefined}>
      <div className="ticker__rail">
        {track(false)}
        {track(true)}
      </div>
      <button
        type="button"
        className="ticker__toggle"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
      >
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  as?: "div" | "article" | "figure" | "li" | "a";
  /** Position in its group — turns a row of siblings into a stagger. */
  index?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
};

/**
 * Scroll-triggered entrance, on an IntersectionObserver and a CSS transition.
 *
 * This used to be Motion. Two chunks of the client bundle carried it, 350 KB
 * raw between them, for a fade and a progress bar — about two percent of what
 * that library does. The same argument that ruled out 700 KB of three.js for
 * an ornament applies here at a smaller scale.
 *
 * The observer sets a data attribute rather than React state: nothing
 * re-renders, and the transition stays interruptible, which a keyframe would
 * not be. Reduced motion and a scripting-disabled browser are handled in CSS
 * next to the rule they affect.
 */
export function Reveal({ as = "div", index = 0, className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.shown = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.shown = "true";
        io.disconnect();
      },
      // A little past the bottom edge, so a plate is already settling as it
      // arrives rather than starting the moment it clips the viewport.
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const El = as as "div";
  return (
    <El
      ref={ref as React.Ref<HTMLDivElement>}
      className={className ? `reveal ${className}` : "reveal"}
      style={{ ...style, "--i": index } as CSSProperties}
      {...rest}
    />
  );
}

/**
 * A lime hairline across the foot of the masthead tracking scroll depth.
 *
 * The system already draws "laser" register lines down the page; this is that
 * idea on the horizontal axis. Written to a custom property inside a single
 * rAF, so a scroll event never does layout work.
 */
export function ScrollRule() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const range = doc.scrollHeight - window.innerHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      el.style.setProperty("--progress", String(progress));
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div ref={ref} className="mast__progress" aria-hidden="true" />;
}

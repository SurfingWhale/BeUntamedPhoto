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
/**
 * Pulls the masthead out of the way going down, brings it back coming up.
 *
 * It is 130px of a 664px phone screen — a fifth of the viewport held by
 * chrome, permanently, on a site whose entire job is showing photographs.
 * This is motion that returns something rather than decorating: scroll down
 * and the pictures get the space back, flick up and navigation is there
 * without a trip to the top.
 *
 * The threshold means a small jitter near the top never triggers it, and it
 * always returns at the top of the document regardless of direction.
 */
export function MastheadRetract() {
  useEffect(() => {
    const mast = document.querySelector<HTMLElement>(".mast");
    if (!mast) return;
    let last = window.scrollY;
    let frame = 0;

    /* Anything else that sticks needs to know how much room this takes, and
     * that it takes none while retracted — otherwise the index header would
     * hold a gap under a masthead that is not there. */
    const publish = (retracted: boolean) => {
      document.documentElement.style.setProperty(
        "--mast-h",
        retracted ? "0px" : `${mast.offsetHeight}px`,
      );
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < 8) return;
      // Past its own height, or the retract would hide it before it is clear.
      const retracted = delta > 0 && y > mast.offsetHeight * 1.5;
      mast.dataset.retracted = retracted ? "true" : "false";
      publish(retracted);
      last = y;
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    publish(false);
    const onResize = () => publish(mast.dataset.retracted === "true");
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      document.documentElement.style.removeProperty("--mast-h");
    };
  }, []);

  return null;
}

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

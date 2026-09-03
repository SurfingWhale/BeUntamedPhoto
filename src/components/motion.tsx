"use client";

import { MotionConfig, motion, useScroll, useSpring } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/* The token easing, so Motion and the CSS transitions agree on one curve.
 * Mirrors --ease-out in tokens.css. */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * reducedMotion="user" is the whole accessibility story for this layer: Motion
 * drops transform and layout animation for visitors who asked for less, and
 * keeps opacity, which is the correct substitute rather than nothing at all.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}

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
 * Scroll-triggered entrance.
 *
 * This replaces the old `.reveal` CSS class, which was motion in name only:
 * a keyframe with `animation-delay` fires on page load for every element on
 * the page, including the ones twenty screens down. By the time you scrolled
 * to them they had long finished, so scrolling revealed nothing. `whileInView`
 * ties the animation to the element actually entering the viewport.
 */
export function Reveal({ as = "div", index = 0, ...rest }: RevealProps) {
  const El = motion[as];
  return (
    <El
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.07 }}
      {...rest}
    />
  );
}

/**
 * A lime hairline across the foot of the masthead tracking scroll depth.
 * The system already draws "laser" register lines down the page (design.md
 * § Grid); this is that same idea on the horizontal axis, so the one piece of
 * always-on motion reads as instrumentation rather than decoration.
 */
export function ScrollRule() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  });
  return <motion.div className="mast__progress" style={{ scaleX }} aria-hidden="true" />;
}

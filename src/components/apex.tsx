/**
 * The apex — the archive's primary mark.
 *
 * Drawn from the owner's own mark sheet, `docs/reference/untamed-marks.png`,
 * which specifies it in words: *"One continuous stroke. Ascending arc that
 * stops sharply at the highest point. The half-second before a thing is
 * over."* That last sentence is also `.story__title` on the home page, so the
 * mark and the copy come from the same place.
 *
 * Every part of the path is that description:
 *
 * - **One continuous stroke**, so it is a `stroke` on a single path and never
 *   a `fill`. Two shapes would be two marks.
 * - **Ascending arc**, so the curve leaves the baseline almost flat and only
 *   steepens at the end — the first control point sits at the start's own y.
 *   A symmetrical arc reads as a swoosh, which this is not.
 * - **Stops sharply**, so `stroke-linejoin: miter` at the apex and
 *   `stroke-linecap: butt` at both ends. A round cap or a bevelled join turns
 *   the sharp stop into a soft one and loses the whole idea.
 *
 * It replaced a literal letter `U` typeset in the display face inside a box,
 * which is what the masthead and the favicon had been drawing.
 *
 * Currency, not colour: the mark takes `currentColor` so it inherits whatever
 * it stands on. There is no colour in this file, which is also what keeps it
 * out of the way of the token gates.
 */
export function Apex({
  size = 32,
  /** Heavier for a favicon, which is read at 16px. */
  weight = 2.8,
  className,
}: {
  size?: number | string;
  weight?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 27.8C11 28 20.5 23 24.8 4L28.5 11" />
    </svg>
  );
}

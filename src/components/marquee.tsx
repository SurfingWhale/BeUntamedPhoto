type Props = {
  /** Repeated end to end. Kept short — this is a sign, not a sentence. */
  items: readonly string[];
};

/**
 * The band under the hero. The track is duplicated and the animation moves
 * it exactly half its width, so the loop closes with no visible seam.
 * aria-hidden because it is decoration: every word in it appears again as a
 * real link further down the page.
 */
export function Marquee({ items }: Props) {
  const run = [...items, ...items];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {run.map((item, i) => (
          <span className="marquee__item" key={`${item}-${i}`}>
            {item}
            <span className="marquee__sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

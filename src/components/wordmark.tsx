/**
 * The wordmark — the owner's own brush lettering, reading "BeUntamed".
 *
 * Not type. `.mast__name` set the name in Archivo with a lime `E` and
 * `.foot__wordmark` still does; this is the drawn lettering from
 * `docs/reference/beuntamed-wordmark-source.png`, which is the logo.
 *
 * **A mask, not an image**, and that is the whole design of this file. The
 * artwork arrived as lime `#A5C012` on transparent, which is a different green
 * from `--color-accent` (`#C4F23E`) — two greens on one page read as a
 * mistake, and a colour baked into a file is a colour no token can reach. So
 * only the alpha channel ships: `public/brand/beuntamed-wordmark.webp` is the
 * same lettering painted black, and the page colours it with `currentColor`.
 *
 * That also settles contrast for free. The masthead inherits `--color-ink`, so
 * the lettering is near-black on paper and near-white in dark — the same as
 * the type it replaced. Lime would have been 1.9:1 on the light ground, which
 * is the mistake `.rail__mark` and `.index-band` both already made.
 *
 * `aria-hidden` by default: every caller so far sits inside a link or a
 * heading that already names the archive, and a second label would read it
 * twice. Pass `label` where nothing else says it.
 *
 * The box is reserved by `aspect-ratio` against a set height rather than by a
 * `min-height` — see the note in CLAUDE.md about flooring a height on a box
 * whose width is derived. Height in, width out.
 */
export function Wordmark({
  className,
  label,
}: {
  className?: string;
  /** An accessible name, when the wordmark is the only thing saying it. */
  label?: string;
}) {
  return (
    <span
      className={className ? `wordmark ${className}` : "wordmark"}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    />
  );
}

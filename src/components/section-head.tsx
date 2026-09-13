/**
 * How every section on the home page opens.
 *
 * The Nomvnt reference opens each of its sections the same way and this page
 * had three different openings: a full-width technical rail before the lanes,
 * an 18px title inside the sticky index bar, and — in exactly one place, the
 * photographic band added for the index — the reference's own treatment.
 * One section following the reference and several not is most of why the page
 * does not read as one thing.
 *
 * The shape, from the images: a small quiet eyebrow with a glyph, then a
 * heading in two lines with the second line stepped in to the right. Sentence
 * case, tightly tracked, left aligned. See docs/PRD-the-reference-layout.md
 * § 3.1 and RESEARCH-reference-vs-built.md § 1 and § 2.
 */
export function SectionHead({
  eyebrow,
  lead,
  tail,
  className,
}: {
  /** The quiet tag above the heading — two or three words. */
  eyebrow: string;
  /** First line of the heading. */
  lead: string;
  /** Second line, which is the one that steps in. */
  tail: string;
  className?: string;
}) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      <p className="section-head__eyebrow">
        <span aria-hidden="true">{"\u2739"}</span> {eyebrow}
      </p>
      <h2 className="section-head__title">
        {lead}
        <span>{tail}</span>
      </h2>
    </div>
  );
}

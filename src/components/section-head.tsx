import type { ReactNode } from "react";

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
 * heading in two lines with the second line stepped in to the right, then a
 * smaller supporting line under it. Sentence case, tightly tracked, left
 * aligned. See docs/PRD-the-reference-layout.md § 3.1 and
 * RESEARCH-reference-vs-built.md § 1 and § 2.
 *
 * The reference's sections carry more words than this page's did — the owner's
 * note, and it is visible in the images: every section has a heading *and* a
 * paragraph, and the heading itself lands its accent on one word. So `lead`
 * and `tail` take nodes rather than strings, and an `<em>` inside either is
 * drawn as a lime highlight — the same device as the hero's, one word per
 * heading, never two.
 */
export function SectionHead({
  eyebrow,
  lead,
  tail,
  sub,
  className,
}: {
  /** The quiet tag above the heading — two or three words. */
  eyebrow: string;
  /** First line of the heading. An `<em>` in here is highlighted in lime. */
  lead: ReactNode;
  /** Second line, which is the one that steps in. */
  tail: ReactNode;
  /**
   * The supporting line under the heading — the reference's smaller grey
   * paragraph. Optional: the lanes' opening is two words and does not want
   * one.
   */
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      <p className="section-head__eyebrow">
        <span aria-hidden="true">{"✹"}</span> {eyebrow}
      </p>
      <h2 className="section-head__title">
        {lead}
        <span>{tail}</span>
      </h2>
      {sub ? <p className="section-head__sub">{sub}</p> : null}
    </div>
  );
}

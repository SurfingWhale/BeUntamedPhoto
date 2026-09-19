import type { StripPlate } from "@/lib/gallery";
import { CARD_THUMB_PHONE_WIDTH } from "@/lib/images";

/**
 * Five more plates from inside a gallery, under its cover.
 *
 * The home index has carried this since 2026-09-14 and `/work` did not, which
 * had it backwards: `/work` is the page a client is actually sent to decide
 * whether this archive shoots what they need, and it showed them nine
 * photographs of a seventy-six plate archive — one cover each. A cover says a
 * gallery exists. The plates behind it say what the job looked like, which is
 * the only question the page is being asked.
 *
 * Five rather than three, and in two rows of the same three columns rather
 * than one row of five: a card is 165 CSS px wide on a phone, so five across
 * would be 30px a box — small enough to read as texture instead of as
 * photographs. Two rows keep every box at the 44x49 the three-up strip
 * measured, and the archive can feed them: eight of the nine galleries hold
 * six plates or more.
 *
 * Deliberately the same component shape, the same `CARD_THUMB_WIDTH` and
 * therefore the same URLs the home index already requests: a visitor who
 * scrolled `/` before tapping through has every one of these in cache, and
 * pays nothing for them here.
 *
 * `aria-hidden`, because the plates are evidence rather than navigation — the
 * card's own title link goes to the gallery where they are shown in full, and
 * three more unlabelled images in the tab order would be three more stops
 * between a keyboard visitor and that link.
 *
 * Three at the least, whatever is there above that. A strip of one reads as a
 * gallery with one photograph in it, which is the opposite of what it is there
 * to say — and one gallery does hold exactly one plate today, so it gets no
 * strip rather than a strip that undersells it.
 */
export function AlbumStrip({ plates }: { plates: StripPlate[] }) {
  const strip = plates.slice(0, 5);
  if (strip.length < 3) return null;

  return (
    <span className="album__strip" aria-hidden="true">
      {strip.map((p) => (
        <picture key={p.id}>
          {/* Viewport, not device pixels — see CARD_THUMB_PHONE_WIDTH. */}
          <source media="(min-width: 60rem)" srcSet={p.srcWide} />
          {/* No eslint-disable needed inside a <picture>, which is the one
              place Next's own component cannot be used anyway. */}
          <img
            src={p.src}
            alt=""
            width={CARD_THUMB_PHONE_WIDTH}
            height={CARD_THUMB_PHONE_WIDTH}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ))}
    </span>
  );
}

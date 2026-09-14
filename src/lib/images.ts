/**
 * Image delivery.
 *
 * Measured before this existed: one home-page load pulled 8,276 KB of
 * photographs on a 375px phone, because every `<img>` pointed at the stored
 * object — a 4000×6000 original is 7.77 MB. That was 27× the weight of all the
 * JavaScript, CSS and fonts on the page combined.
 *
 * Supabase serves a render endpoint that resizes on the fly and negotiates
 * WebP from the Accept header. The same photograph at 750px is 211 KB, a 97.4%
 * reduction, and at 375px it is 108 KB.
 *
 * Public files build their URL as a plain string, so a full srcset costs
 * nothing. Private files cannot: the transform is signed into the token, and
 * the batch signer takes no transform options, so each one is signed
 * individually at a single sensible width.
 */

const RENDER_PUBLIC = "/storage/v1/render/image/public/";

/** Default quality. 72 sits below the point where the difference is visible on
 * a photograph and well below the point where the file stops shrinking. */
export const QUALITY = 72;

/** Widths offered to the browser. Covers 320–430px phones at 1×–3× DPR and a
 * 1440px measure at 2×, without asking the renderer for sizes nothing uses. */
const WIDTHS = [375, 640, 750, 1080, 1500, 2000, 2880];

/** One width the private path can afford, since each costs a signing round
 * trip. Covers a phone at 3× and the 1440px measure at 1×. */
export const PRIVATE_WIDTH = 1500;

/**
 * The contact sheet in the darkroom, whose thumbnail is a 96px square.
 *
 * The darkroom was asking for PRIVATE_WIDTH and painting it into 96px:
 * 15.6x oversized on each axis, ~244x the pixels the box can show. Measured,
 * a 1500px render of a plate here is 263KB as WebP, so a page of 24 pulled
 * about 6.3MB to draw 24 thumbnails. 288 is 96 at 3x, which is the densest
 * phone, and lands near 20KB each.
 */
export const THUMB_WIDTH = 288;

/**
 * The four covers along the foot of the hero, which render at 56px.
 *
 * A fixed box that small wants one small file, not a ladder: the smallest
 * candidate WIDTHS offers is 375w, and the gates caught it pulling that for a
 * 56px box — 2.2x the pixels at 3x DPR. Asked for directly, with no srcset and
 * no sizes, the same way the darkroom's contact sheet does it.
 */
export const HERO_THUMB_WIDTH = 168;

/**
 * The three plates in a home-index card's contact strip.
 *
 * Same reasoning as HERO_THUMB_WIDTH and the same shape — one small file, no
 * ladder — because the strip's height is fixed by `--row` rather than derived
 * from the card, so the box has a known ceiling at every viewport:
 *
 *   desktop   92 x 60 CSS px   (a span-3 card, three boxes across)
 *   phone     45 x 49          (two cards up, so the card is narrower)
 *
 * 288 covers 96 at 3x, which is past the widest box on the densest phone, and
 * lands near 20KB each — the same figure THUMB_WIDTH measured. It has to be a
 * ceiling and not a fit: a lazy box inside a grid picks its candidate when it
 * scrolls into view, and `trimSrcSet`'s note above is the record of what
 * mistimed picks cost.
 */
export const CARD_THUMB_WIDTH = 288;

function origin(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return url.replace(/\/$/, "");
}

/**
 * A height must be sent with the width.
 *
 * Given `width` alone the render endpoint resizes that axis and leaves the
 * other at the source value: a 4000×6000 plate came back 750×6000, squashed,
 * and `object-fit: cover` then cropped 90% of it away to fit the box. It also
 * cost 205 KB to encode those wasted pixels, against 47 KB for the correct
 * 750×1125.
 *
 * `resize=contain` fits the image inside the box without distorting it, so
 * with the true ratio the output is exactly width×height, and with an unknown
 * ratio the 1:3 bound below still preserves the aspect.
 */
export function publicSrc(
  bucket: string,
  path: string,
  width: number,
  intrinsicWidth?: number | null,
  intrinsicHeight?: number | null,
): string {
  const height =
    intrinsicWidth && intrinsicHeight
      ? Math.round((width * intrinsicHeight) / intrinsicWidth)
      : width * 3;
  const q = new URLSearchParams({
    width: String(width),
    height: String(height),
    resize: "contain",
    quality: String(QUALITY),
  });
  return `${origin()}${RENDER_PUBLIC}${bucket}/${path}?${q}`;
}

/**
 * A srcset capped at the photograph's own width — asking the renderer to
 * upscale wastes bytes to add nothing.
 */
export function publicSrcSet(
  bucket: string,
  path: string,
  intrinsicWidth: number | null,
  intrinsicHeight: number | null,
): string {
  const widths = WIDTHS.filter((w) => !intrinsicWidth || w <= intrinsicWidth);
  if (widths.length === 0) widths.push(intrinsicWidth ?? WIDTHS[0]);
  return widths
    .map((w) => `${publicSrc(bucket, path, w, intrinsicWidth, intrinsicHeight)} ${w}w`)
    .join(", ");
}

/**
 * Drop every candidate above `maxWidth` from an already-built srcset.
 *
 * A `sizes` declaration is a promise about layout, and the browser keeps it —
 * but only at the moment it decides to load. A lazy frame inside a horizontal
 * reel is decided mid-scroll, and the gates caught the archive lane taking a
 * 1500w candidate for a 271px box and a 2000w for a 414px one, where the same
 * slot in an isolated run settles on 1080w. Chasing that with a tighter
 * `sizes` is chasing the symptom: the declaration is already correct.
 *
 * A ceiling cannot be mistimed. The lane frame is 218px wide at 320 and 416px
 * at 1440 and never larger — measured, and the box is fixed by
 * `.reel__frame`'s own height — so 1080w covers a 416px box at 2x and a 304px
 * box at 3x, which is every real device. Anything above it was unusable
 * however the pick was timed.
 */
export function trimSrcSet(srcSet: string | null, maxWidth: number): string | undefined {
  if (!srcSet) return undefined;
  const kept = srcSet
    .split(",")
    .map((c) => c.trim())
    .filter((c) => {
      const w = Number.parseInt(c.split(/\s+/).pop()?.replace("w", "") ?? "", 10);
      return Number.isFinite(w) && w <= maxWidth;
    });
  /* Never return nothing: a photograph smaller than the cap has every
   * candidate filtered out, and an empty srcset makes the browser fall back to
   * `src`, which is the largest thing we have. */
  return kept.length ? kept.join(", ") : srcSet;
}

/** The widest a .reel__frame ever renders, so nothing above it is offered. */
export const LANE_MAX_WIDTH = 1080;

/**
 * The widest a `.pair` figure renders — the two plates in the opening zone.
 *
 * Same reasoning as LANE_MAX_WIDTH: these are lazy, so the browser picks their
 * candidate when they scroll into view rather than at layout, and a ceiling
 * cannot be mistimed the way a `sizes` declaration can. Measured box below.
 */
export const PAIR_MAX_WIDTH = 1080;

/**
 * `sizes` per slot, so the browser picks from the srcset before layout.
 * These mirror the breakpoints in globals.css — change them together.
 */
/**
 * `sizes` per slot, so the browser picks from the srcset before layout.
 *
 * Every value below was measured, not reasoned about: the real rendered box
 * was read at 390, 430, 768 and 1280 CSS px, multiplied by that viewport's
 * DPR, and the declaration tuned until the browser lands on the smallest
 * candidate in WIDTHS that covers it at all four. A `sizes` that over-declares
 * by one step is not a rounding error — it is the next candidate up, which on
 * a phone was 1500w where 640w would do.
 *
 * Verified by letting the browser resolve each declaration against the real
 * candidate list at those four viewports — 16 slot/viewport pairs, 14 of them
 * landing on the smallest candidate that covers the box. The two that do not
 * are `cover` at 768 and 1280, each one step over on a 284-347px thumbnail;
 * the values that would close them resolve close enough to a boundary to risk
 * under-declaring instead, and a soft photograph costs more than those bytes.
 * Every phone width is optimal.
 *
 * These mirror the breakpoints in globals.css. Change them together, and
 * re-measure rather than re-derive: two of these were wrong precisely because
 * a column count changed and the declaration did not.
 */
export const SIZES = {
  /** .fold-photo — genuinely full-bleed, no gutters. */
  fold: "100vw",
  /**
   * .fold-photo[data-shape="portrait"] above 60rem, where a vertical plate
   * stops bleeding and stands as a centred column instead — see globals.css.
   * The frame is seven rows tall with its width derived from the plate's own
   * ratio, so a 2:3 plate renders 560px wide inside a 1440px viewport while
   * `fold` was still declaring 100vw: it pulled the 2880w candidate for a
   * 560px box, 2.57x the pixels it can show. 700px covers the range of ratios
   * the archive files and lands on 1500w.
   */
  foldPortrait: "(min-width: 60rem) 700px, 100vw",
  /**
   * .album__media on /work and the genre pages. Two columns from the smallest
   * width since the /work grid changed; the measured box is 43-44% of the
   * viewport up to 60rem and 53% on the twelve-column field above it.
   * This said `100vw` after that change and pulled 1500w for a 167px box.
   */
  tile: "(min-width: 60rem) 54vw, 45vw",
  /**
   * .album__media, per card, because the twelve-column field gives cards three
   * different widths and one declaration cannot describe all three.
   *
   * The grid spans 7, 5, 5, 7, 6, 6 and repeats, so a card is 771, 537, 537,
   * 771, 654 or 654px at 1440 — measured, not derived. `tile` above declares
   * 54vw for every one of them, which is right for a span of 7 and 45% too
   * wide for a span of 5: 777 CSS px x2 DPR asks for 1554, and the ladder has
   * no candidate between 1500 and 2000, so a 537px card pulled a 2000w file.
   * 1.86x the pixels it can show, on the survey page a client is sent a link
   * to. Reproduced on localhost and against the live deployment.
   *
   *   span 5   537px  needs 1074   37vw -> 1066 -> picks 1080   (was 2000)
   *   span 6   654px  needs 1308   46vw -> 1325 -> picks 1500   (was 2000)
   *   span 7   771px  needs 1543   54vw -> 1554 -> picks 2000   (unchanged)
   *
   * Below 60rem the grid is two up at every width, so all three collapse to
   * the same 45vw `tile` already declares.
   */
  tileSpan5: "(min-width: 60rem) 37vw, 45vw",
  tileSpan6: "(min-width: 60rem) 46vw, 45vw",
  /** .strip__frame, the opening plate — full width less the page gutters,
   * which measures 90-92%, not the 100vw it used to claim. */
  plate: "(min-width: 60rem) 48vw, 91vw",
  /** .strip__frame, every plate after the first — two up at every width, so
   * ~45% below 60rem and ~32% of the wider measure above it. */
  plateHalf: "(min-width: 60rem) 32vw, 45vw",
  /** .plates__thumb — a fixed 96px contact-sheet square. */
  thumb: "96px",
  /**
   * .reel__frame — the archive's own lane banner, whose plate has no ratio
   * this file can know, so this describes the **box** rather than the painted
   * area. The two borrowed banners have fixed ratios and declare their painted
   * width directly in site.ts; this one cannot, because a landscape plate
   * fills the box while a portrait one letterboxes inside it.
   *
   * Re-measured 2026-09-14 when the lanes started stacking below 48rem. The
   * box widens on a phone and the old 304px under-declared it, which is the
   * expensive direction — an under-declared slot picks a candidate too small
   * and the frame goes soft:
   *
   *          320    390    430    768   1024   1440
   *   box    278    348    388    309    291    414
   *   was    304    304    304    311    293    416
   *   now    291    355    391    311    293    416
   *
   * 91vw covers all three phone widths with 1-3px to spare; the fixed values
   * from 48rem up are unchanged, because stacking stops there.
   *
   * Known and left: for a *portrait* plate the painted area is far narrower
   * than the box — a 2:3 plate paints 143px of a 348px box at 390 — so this
   * declaration over-fetches for the archive's usual shape. Closing it means
   * deriving the slot from `archiveBanner.width/height` at render time, which
   * is real and is noted in pending-task.md rather than done here. Declaring
   * the box is the safe direction; a landscape plate needs every pixel of it.
   */
  lane: "(min-width: 90rem) 416px, (min-width: 64rem) 293px, (min-width: 48rem) 311px, 91vw",
  /**
   * `.pair` — the two plates in the opening zone. Two up at every width: half
   * the page measure below 60rem, then half of the seven columns the section
   * gives them above it. Measured box, which is why 768 is *wider* than 1280
   * — below 60rem the pair has the whole measure, above it only seven twelfths
   * of the field:
   *
   *          390    430    768   1280   1440
   *   box    167    187    345    332    379
   *
   * 45vw declares 176 / 194 / 346 and 27vw declares 346 / 389. A first pass at
   * 24vw under-declared 1440 by 9%, which is the direction that costs a soft
   * photograph rather than bytes — caught by measuring, not by the arithmetic.
   */
  pair: "(min-width: 60rem) 27vw, 45vw",
  /**
   * `.reel__frame` in the home index, per span. The grid runs a rhythm of six
   * — 5, 4, 3, 4, 5, 3 columns of twelve above 60rem — so there are three
   * widths, not one. Measured, not derived:
   *
   *            1280   1440
   *   span 5    489    555     -> 39vw
   *   span 4    387    441     -> 31vw
   *   span 3    286    326     -> 23vw
   *
   * Below 60rem the grid is two up and only the first card spans both, so
   * there are two widths there: 348/705 for the lead and 165/343 for the rest,
   * declared 92vw and 45vw.
   */
  cardSpan5: "(min-width: 60rem) 39vw, 45vw",
  cardSpan4: "(min-width: 60rem) 31vw, 45vw",
  cardSpan3: "(min-width: 60rem) 23vw, 45vw",
} as const;

/**
 * The `sizes` for the card at index `i` of the **home index** grid.
 *
 * The span pattern in globals.css is 5, 4, 3, 4, 5, 3 on
 * `.index-grid > .reel__card:nth-child(6n+k)` above 60rem, and only the very
 * first card spans the full measure below it. Change one and change the other:
 * they describe the same boxes, and a `sizes` that disagrees with its grid is
 * not a rounding error — it is the next candidate up.
 */
export function cardSizes(i: number): string {
  /* Index 0 is the only card that spans both columns on a phone. */
  if (i === 0) return "(min-width: 60rem) 39vw, 92vw";
  const span = [5, 4, 3, 4, 5, 3][i % 6];
  if (span === 4) return SIZES.cardSpan4;
  if (span === 3) return SIZES.cardSpan3;
  return SIZES.cardSpan5;
}

/**
 * The `sizes` for the card at index `i` of the /work grid.
 *
 * The span pattern in globals.css is 7, 5, 5, 7, 6, 6 on
 * .album:nth-child(6n+k) above 60rem. Change one and change the other — they
 * describe the same boxes, and a `sizes` that disagrees with its grid is not
 * a rounding error, it is the next candidate up.
 */
export function tileSizes(i: number): string {
  const span = [7, 5, 5, 7, 6, 6][i % 6];
  if (span === 5) return SIZES.tileSpan5;
  if (span === 6) return SIZES.tileSpan6;
  return SIZES.tile;
}

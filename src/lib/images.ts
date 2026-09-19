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
 * 1440px measure at 2×, without asking the renderer for sizes nothing uses.
 *
 * 540 is here because of the gap it fills, not because a slot asks for it by
 * name. The card grids land on 161–172 CSS px at 390 — /work's covers and the
 * home index's — which is 483–516 device px on a 3× phone, and the ladder went
 * 375 straight to 640. 375 under-serves those boxes, so every one of them took
 * 640. Measured against three plates through the render endpoint:
 *
 *   375w  26kB     512w  44kB     560w  50kB
 *   480w  39kB     540w  48kB     640w  62kB
 *
 * 540 is the smallest step that still covers 516, and it is 22% lighter than
 * the file those boxes were taking — about 126kB off /work and 120kB off / on
 * a 3× phone. A wider phone still picks 640, which is correct: there the box
 * really is that big. */
const WIDTHS = [375, 540, 640, 750, 1080, 1500, 2000, 2880];

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

/**
 * The same strip on a phone, where the box is 44 x 49 rather than 89 x 60.
 *
 * 288 is the ceiling the desktop box needs and the phone was paying it: 132
 * device px of need answered with 288, 11kB a plate where 160w is 5kB. With
 * three plates on each of nine cards that is 162kB a page, on / and on /work
 * both, and it is spent on the connection this archive is mostly read over.
 *
 * Delivered through <picture> with a media query rather than a srcset, for
 * the reason DECK_FRAME_WIDE gives: `sizes` resolves against device pixels, so
 * a 3x phone would ask for the wide file anyway. A media source is answered by
 * the viewport alone.
 */
export const CARD_THUMB_PHONE_WIDTH = 160;

/**
 * The deck frames on a wide screen.
 *
 * The lane card grows above 60rem so two large cards show instead of three
 * small ones, and .deck__frames is three equal columns — so the photographs
 * grow with it, past what a 288w file can cover. At a 40rem card each frame
 * renders about 195 CSS px, which needs 390 at 2x.
 *
 * Delivered through <picture> with a media query rather than srcset, and that
 * is deliberate: `sizes` resolves against device pixels, so a 3x phone asking
 * for a 98px frame needs 294 and would take this file too — 43KB against
 * 17KB, nine times over, on the connection that can least afford it. A media
 * source is answered by the viewport alone. Measured: 288w is 17,096 B and
 * 480w is 43,040 B for the same plate as WebP.
 */
export const DECK_FRAME_WIDE = 480;

/**
 * The lead frame of a lane card, which is the section's subject.
 *
 * design.md § 4 gives every section one photograph that is four to six times
 * the others. On a phone this frame has spanned its card since 2026-09-17 and
 * was still being served the 288w file the three-up stamps used: a 294 CSS px
 * box at 1x on a 3x phone, which is where "the photographs look soft" comes
 * from. 640 covers it at 2x and is 0.73x at 3x, which for a photograph is the
 * right trade against 62kB.
 *
 * The wide file is for the same frame above 48rem, where it takes two of the
 * card's three columns — 417 CSS px inside a 626px card at 1440, so 1080
 * covers it at 2x. Both are delivered by <picture> media rather than srcset,
 * for the reason DECK_FRAME_WIDE gives.
 */
export const DECK_LEAD_WIDTH = 640;
export const DECK_LEAD_WIDE = 1080;

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
   * PhotoFold's plate, which never bleeds: all three callers — the closing
   * plate on / and both plates on /about — wrap it in `.plinth`, and the slab
   * pads itself by `--page-gutter`.
   *
   * `fold` declares 100vw, which is right for the hero and the index band
   * because those two really do run edge to edge. Inside the slab it claimed
   * the gutters as well: a 350px box on a 390px phone is 1050 device px at 3x,
   * was declared as 1170, and took the 1500w file — 248kB where 1080w is
   * 155kB, measured on the closing plate.
   *
   * 2.5rem is twice the gutter's own floor. Where the clamp has grown past
   * that this over-declares by a few percent and the browser picks the larger
   * candidate, which is the direction that costs bytes rather than sharpness.
   */
  foldPlate: "calc(100vw - 2.5rem)",
  /**
   * The same plate when it is portrait, which above 60rem stops bleeding and
   * stands as a centred column — see .fold-photo[data-shape] in globals.css.
   * The frame is seven rows tall with its width derived from the plate's own
   * ratio, so a 2:3 plate renders 560px wide inside a 1440px viewport, and a
   * flat 100vw here once pulled the 2880w candidate for that box, 2.57x the
   * pixels it can show. 700px covers the range of ratios the archive files.
   */
  foldPlatePortrait: "(min-width: 60rem) 700px, calc(100vw - 2.5rem)",
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
  /* Phone value re-measured when the lanes became rows below 48rem: the
   * archive frame paints at 32.7-34.6vw across 320-430. 32vw rather than the
   * measured 34 on purpose — at 390 and 3x, 34vw needs 399 device px and the
   * ladder's next rung is 640w, which the gate correctly flags as over-asking
   * a 133px box. 32vw lands on 375w, 6% under on a 133px thumbnail, which is
   * not visible, against a file more than twice the size. */
  lane: "(min-width: 90rem) 416px, (min-width: 64rem) 293px, (min-width: 48rem) 311px, 32vw",
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
   * `.reel__frame` in the home index. Two widths above 60rem, because the grid
   * is three columns and a card spans either two of them or one; one width
   * below it, where the grid is two up and every card takes a column.
   *
   * Measured, not derived:
   *
   *            390   768   1280   1440
   *   span 2     -     -    811    918    -> 64vw
   *   span 1   157   346    393    446    -> 31vw above 60rem, 46vw below
   *
   * Re-measured from scratch when the grid went from twelve columns to three:
   * the old set described spans of 5, 4 and 3 of twelve and every one of them
   * was wrong for a three-column field. A `sizes` that disagrees with its grid
   * is not a rounding error, it is the next candidate up.
   */
  cardWide: "(min-width: 60rem) 64vw, 46vw",
  cardCol: "(min-width: 60rem) 31vw, 46vw",
} as const;

/**
 * The `sizes` for the card at index `i` of the **home index** grid.
 *
 * The grid is three columns above 60rem and cards 10n+1 and 10n+7 span two of
 * them; everything else spans one. Change that pattern and change this — they
 * describe the same boxes, and a `sizes` that disagrees with its grid is not a
 * rounding error, it is the next candidate up.
 */
export function cardSizes(i: number): string {
  /* Two of the ten span two columns — the LARGE in each of the brief's two
   * compositions. Every other card takes one. Below 60rem nothing spans, so
   * both declarations fall back to the same 46vw. */
  const wide = i % 10 === 0 || i % 10 === 6;
  return wide ? SIZES.cardWide : SIZES.cardCol;
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

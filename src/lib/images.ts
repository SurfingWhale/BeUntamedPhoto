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
   * .album__media on /work and the genre pages. Two columns from the smallest
   * width since the /work grid changed; the measured box is 43-44% of the
   * viewport up to 60rem and 53% on the twelve-column field above it.
   * This said `100vw` after that change and pulled 1500w for a 167px box.
   */
  tile: "(min-width: 60rem) 54vw, 45vw",
  /** .strip__frame, the opening plate — full width less the page gutters,
   * which measures 90-92%, not the 100vw it used to claim. */
  plate: "(min-width: 60rem) 48vw, 91vw",
  /** .strip__frame, every plate after the first — two up at every width, so
   * ~45% below 60rem and ~32% of the wider measure above it. */
  plateHalf: "(min-width: 60rem) 32vw, 45vw",
  /** .plates__thumb — a fixed 96px contact-sheet square. */
  thumb: "96px",
  /**
   * .reel__frame — a cover in the index reel. The card is `min(78%, 21rem)` of
   * the reel's content box, which inside the index section measures 242px on a
   * 390px phone and 347px at 1280.
   */
  cover: "(min-width: 60rem) 22rem, (min-width: 48rem) 38vw, 62vw",
} as const;

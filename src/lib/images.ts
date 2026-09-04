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

export function publicSrc(bucket: string, path: string, width: number): string {
  const q = new URLSearchParams({ width: String(width), quality: String(QUALITY) });
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
): string {
  const widths = WIDTHS.filter((w) => !intrinsicWidth || w <= intrinsicWidth);
  if (widths.length === 0) widths.push(intrinsicWidth ?? WIDTHS[0]);
  return widths.map((w) => `${publicSrc(bucket, path, w)} ${w}w`).join(", ");
}

/**
 * `sizes` per slot, so the browser picks from the srcset before layout.
 * These mirror the breakpoints in globals.css — change them together.
 */
export const SIZES = {
  /** .fold-photo — full bleed at every width. */
  fold: "100vw",
  /** .album__media — one column, then two at 40rem, then irregular spans on
   * the 12-column field at 60rem, where a tile is between 4 and 7 columns. */
  tile: "(min-width: 60rem) 50vw, (min-width: 40rem) 50vw, 100vw",
  /** .strip__frame — full width inside the page gutter, narrower on the
   * 12-column cascade. */
  plate: "(min-width: 60rem) 60vw, 100vw",
  /** .plates__thumb — a fixed 72px contact-sheet square. */
  thumb: "72px",
} as const;

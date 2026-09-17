import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getAlbumsWithCovers, getFeatured } from "@/lib/gallery";
import { publicSrc } from "@/lib/images";

/**
 * The parts every share card is built from.
 *
 * Two cards draw this — the site's and one per genre — and they were drifting:
 * both were a slab with the wordmark set in the display face as
 * `UNTAM<lime>E</lime>D`, which is the pre-rename name *and* a wordmark the
 * site stopped using when the owner supplied the drawn one. A link pasted into
 * WhatsApp unfurled with the old brand on it.
 *
 * The other half of the same complaint is what the card did not have: "banner
 * pas share gaada gambar jadi user ga interested di depan dan terlalu
 * vibecoding nuansanya". It was type on a dark ground, next to the owner's own
 * food-photography card which shows four real plates — so the photographer's
 * card was the one with no photographs on it. The recipient decides in about a
 * second, and a typographic slab reads as a template.
 */

/* Satori cannot read the WOFF2 that next/font downloads, so the TTFs are
 * vendored under assets/. See assets/README.md. */
export const display = await readFile(
  join(process.cwd(), "assets/Archivo-ExpandedExtraBold.ttf"),
);
export const mono = await readFile(
  join(process.cwd(), "assets/JetBrainsMono-Regular.ttf"),
);

/**
 * The drawn wordmark, as a data URI.
 *
 * `public/brand/beuntamed-wordmark.webp` is the file the site uses, and it
 * cannot be used here: it is black-on-alpha because the site treats it as a
 * CSS mask, Satori has no mask support, and black lettering on this slab is
 * nothing at all. `scripts/build-share-wordmark.mjs` bakes a paper-coloured
 * PNG of it; that is what this reads.
 */
const wordmarkPng = await readFile(
  join(process.cwd(), "assets/brand/wordmark-paper.png"),
);
export const WORDMARK = `data:image/png;base64,${wordmarkPng.toString("base64")}`;
/** The artwork's own ratio, so the box is never guessed. */
export const WORDMARK_RATIO = 826 / 251;

export const SLAB = "#051C14";
export const LIME = "#C4F23E";
export const PAPER = "#FBFBF9";
export const DIM = "#ABCFBB";

/**
 * A photograph, fetched and inlined as JPEG.
 *
 * Handing Satori the storage URL directly would be simpler and is the thing
 * not to do. Supabase's render endpoint negotiates WebP off the `Accept`
 * header, Satori is not reliable about decoding WebP, and a card that throws
 * is worse than a card with no photograph on it — the unfurl falls back to no
 * image at all. So the fetch happens here, with an `Accept` that asks for
 * something Satori certainly reads, and anything unexpected returns null for
 * the caller to leave out.
 *
 * `width` is in card pixels, not CSS pixels: the card is rasterised once at
 * 1200x630, so a 252px box wants a 252px file and there is no DPR to cover.
 */
export async function plateSrc(
  path: string,
  width: number,
  intrinsicWidth: number | null,
  intrinsicHeight: number | null,
): Promise<string | null> {
  try {
    const response = await fetch(
      publicSrc("gallery", path, width, intrinsicWidth, intrinsicHeight),
      { headers: { Accept: "image/jpeg,image/png" } },
    );
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!/^image\/(jpeg|png)$/.test(type)) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Up to `count` photographs for a card, already inlined.
 *
 * Every failure here is swallowed on purpose, and this is the one place in the
 * codebase where that is right. `lib/gallery.ts` throws when the archive
 * cannot be read because an empty archive rendered at 200 looks like a
 * finished, blank site — the argument is written out in that file. A share
 * card is the opposite case: it has no reader to tell, it is generated at
 * build time, and a throw means the link unfurls with no card whatsoever.
 * Fewer photographs, or none, still leaves a card with the brand on it, which
 * is what this replaced.
 *
 * Asks the archive for more rows than it needs, twice over: a held-back plate
 * carries no public path, and a fetch can come back in a format Satori will
 * not read, so both thin the list after the query rather than before it.
 */
async function inline(
  rows: { bucket: string; path: string; width: number | null; height: number | null }[],
  count: number,
  width: number,
): Promise<string[]> {
  const sources = await Promise.all(
    rows
      .filter((p) => p.bucket === "gallery")
      .slice(0, count * 2)
      .map((p) => plateSrc(p.path, width, p.width, p.height)),
  );
  return sources.filter((s): s is string => s !== null).slice(0, count);
}

/** Plates for the site card — the archive's own featured order. */
export async function sitePlates(count: number, width: number): Promise<string[]> {
  try {
    return await inline(await getFeatured(count * 3), count, width);
  } catch {
    return [];
  }
}

/**
 * Plates for one genre's card.
 *
 * The covers of that lane's galleries, which is the honest answer to "what
 * does graduation work here look like" — a card headed Graduation carrying
 * food plates would be worse than carrying none.
 *
 * Two of the five lanes have nothing filed (pending-task.md § 3), and those
 * fall back to no photographs rather than to the archive's general ones, for
 * the same reason: the card would be showing work from a different lane under
 * this lane's name.
 */
export async function genrePlates(
  genre: string,
  count: number,
  width: number,
): Promise<string[]> {
  try {
    const albums = await getAlbumsWithCovers(genre);
    const covers = albums
      .map((a) => a.cover)
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    return await inline(covers, count, width);
  } catch {
    return [];
  }
}

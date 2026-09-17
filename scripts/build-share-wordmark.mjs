/* The drawn wordmark, repainted for the share card.
 *
 * public/brand/beuntamed-wordmark.webp is the artwork the site uses, and it is
 * pure black with an alpha channel because the site uses it as a CSS mask —
 * `.wordmark` sets `background: currentColor` and lets the mask cut the
 * lettering out of it, which is what makes one file follow every theme token.
 *
 * The share card cannot do that. Satori has no mask support, so the card has
 * to draw the wordmark as an ordinary <img>, and that file drawn as an image
 * is black lettering on a near-black slab: invisible. WebP is also not a
 * format Satori is reliable about decoding.
 *
 * So this bakes one PNG in the paper colour, read out of tokens.css rather
 * than typed here for the same reason build-icons.mjs reads the accent out of
 * it: a hardcoded hex would keep rendering the old colour the day the token
 * changed, and a share card is a surface no gate reads.
 *
 * Run it when the wordmark or --color-paper changes:
 *   node scripts/build-share-wordmark.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";

const SRC = "public/brand/beuntamed-wordmark.webp";
const OUT = "assets/brand/wordmark-paper.png";

const token = (name) => {
  const m = readFileSync("tokens.css", "utf8").match(
    new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, "m"),
  );
  if (!m) throw new Error(`tokens.css declares no ${name}`);
  return m[1].trim();
};

/** "#FBFBF9" -> { r, g, b }. The token is a hex literal; nothing else is. */
function hex(value) {
  const m = /^#([0-9a-f]{6})$/i.exec(value);
  if (!m) throw new Error(`expected a 6-digit hex, got ${value}`);
  const n = Number.parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const paper = hex(token("--color-paper"));

const src = sharp(SRC);
const { width, height } = await src.metadata();
if (!width || !height) throw new Error(`${SRC} has no dimensions`);

/* The lettering is the alpha channel — the RGB is uniformly zero — so the
 * shape is lifted out as a greyscale mask and used as the alpha of a solid
 * paper-coloured plate. */
/* `.raw()` is not optional: without it toBuffer() hands back an *encoded*
 * single-channel image, and joinChannel wants the pixels — 13,650 bytes of PNG
 * where it expects 826 x 251 = 207,326 of them. */
const alpha = await sharp(SRC).ensureAlpha().extractChannel("alpha").raw().toBuffer();

mkdirSync("assets/brand", { recursive: true });
await sharp({ create: { width, height, channels: 3, background: paper } })
  .joinChannel(alpha, { raw: { width, height, channels: 1 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const out = await sharp(OUT).stats();
console.log(`${OUT}  ${width}x${height}`);
console.log(
  `  channel means: ${out.channels.map((c) => Math.round(c.mean)).join(", ")}` +
    `  (RGB should be near ${paper.r},${paper.g},${paper.b} where opaque)`,
);

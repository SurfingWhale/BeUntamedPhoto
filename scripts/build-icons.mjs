/* Render the icon set from the same path components/apex.tsx draws, so the
   favicon and the masthead cannot drift apart. Chromium rasterises it; the
   sizes and the maskable safe zone are the only things that differ.
   Run it when the mark changes: `node scripts/build-icons.mjs`. */
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

/* Read the path out of the component rather than repeating it here. If the
   mark changes, re-running this picks the change up; a copy would not. */
const src = readFileSync("src/components/apex.tsx", "utf8");
const d = src.match(/<path d="([^"]+)"/)[1];

/* And the two colours out of tokens.css, for exactly the same reason. A
 * hardcoded #c4f23e here would keep rendering the old accent the day the token
 * changes, and nothing would fail — an icon is the one surface no gate reads.
 * The light-theme :root block is the right one: an icon has no theme, and the
 * app tile has always been dark ground with lime ink. */
const token = (name) => {
  const m = readFileSync("tokens.css", "utf8").match(
    new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, "m"),
  );
  if (!m) throw new Error(`tokens.css declares no ${name}`);
  return m[1].trim();
};
const ink = token("--color-accent");
const ground = token("--color-paper-dark");
const rule = ink;

/* `inset` is the mark's margin inside the tile, in viewBox units. A maskable
   icon is cropped to a circle covering the central 80%, so its mark has to sit
   well inside that — hence the wider inset and no border. */
const TILES = [
  { out: "src/app/icon.png",                    px: 256, inset: 5.5, weight: 3.4, border: true },
  { out: "src/app/apple-icon.png",              px: 180, inset: 6.5, weight: 3.4, border: true },
  { out: "public/icons/icon-192.png",           px: 192, inset: 5.5, weight: 3.4, border: true },
  { out: "public/icons/icon-512.png",           px: 512, inset: 5.5, weight: 3.4, border: true },
  { out: "public/icons/icon-maskable-512.png",  px: 512, inset: 9.5, weight: 3.2, border: false },
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const t of TILES) {
  const page = await browser.newPage({ viewport: { width: t.px, height: t.px }, deviceScaleFactor: 1 });
  /* One tile, no page margin, so the screenshot is the icon exactly. The mark
     is scaled by placing it in a nested viewBox inset on all four sides. */
  const inner = 32 - t.inset * 2;
  await page.setContent(`<!doctype html><html><body style="margin:0;background:${ground}">
    <svg width="${t.px}" height="${t.px}" viewBox="0 0 32 32" style="display:block">
      ${t.border ? `<rect x="1" y="1" width="30" height="30" fill="none" stroke="${rule}" stroke-width="0.6"/>` : ""}
      <svg x="${t.inset}" y="${t.inset}" width="${inner}" height="${inner}" viewBox="0 0 32 32"
           fill="none" stroke="${ink}" stroke-width="${t.weight}"
           stroke-linecap="butt" stroke-linejoin="miter">
        <path d="${d}"/>
      </svg>
    </svg></body></html>`);
  await page.screenshot({ path: t.out, omitBackground: false });
  await page.close();
  console.log(`${t.out.padEnd(36)} ${t.px}x${t.px}`);
}
await browser.close();

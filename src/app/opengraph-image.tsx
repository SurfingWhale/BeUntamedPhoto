import { ImageResponse } from "next/og";

import { genres, site } from "@/lib/site";
import {
  DIM,
  LIME,
  SLAB,
  WORDMARK,
  WORDMARK_RATIO,
  display,
  mono,
  sitePlates,
} from "@/lib/share-card";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The photo column takes 44% of the card and holds a 2x2 grid, so each frame
 * is (1200 * 0.44 - 6) / 2 = 261 card pixels wide — and the whole column, 528,
 * when the archive could only supply one plate.
 *
 * The file asked for covers that widest case rather than the usual one, and
 * over-fetching is genuinely free here: the card is rasterised to a PNG once
 * at build time, so the source width changes how long a build takes and
 * nothing a reader downloads. Fitting it to 261 instead would upscale the
 * one-plate card, which is the direction that shows. */
const PHOTO_COL = 0.44;
const GAP = 6;
const FRAME_W = Math.round((size.width * PHOTO_COL - GAP) / 2);
const FRAME_H = Math.round((size.height - GAP) / 2);
const FETCH_W = Math.round(size.width * PHOTO_COL);

/** The wordmark box: a width, with the height taken from the artwork. */
const MARK_W = 452;
const MARK_H = Math.round(MARK_W / WORDMARK_RATIO);

/**
 * The share card.
 *
 * Someone sends this link in a WhatsApp message and the recipient decides in
 * about a second whether it looks like a real practice or a scrape. It decided
 * wrongly for months, in two ways at once, and the owner named both: the card
 * was the pre-rename `UNTAM E D` wordmark set in the display face, and it had
 * no photograph anywhere on it — "banner pas share gaada gambar jadi user ga
 * interested di depan dan terlalu vibecoding nuansanya."
 *
 * So: four real plates out of the archive, bleeding off the trailing edge, and
 * the drawn wordmark rather than the name typeset. A photographer's card leads
 * with photographs.
 *
 * It degrades rather than failing. `sitePlates` swallows every error and
 * returns what it managed to inline, and the layout answers 4, 2, 1 and 0 of
 * them — because this file is generated at build time with no reader to tell,
 * and a throw here means the link unfurls with no card at all. The brand block
 * is the card at nought photographs, which is exactly what this replaced.
 */
export default async function Image() {
  const plates = await sitePlates(4, FETCH_W);
  /* Named from `genres`, not from the tagline and not typed out. The tagline
   * is a sentence and slicing it apart left "event photography" as the last
   * item; a hand-written list of five is the drift that printed a nonsense
   * commissions line on /about. */
  const lanes = genres.map((g) => g.label.toLowerCase()).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: SLAB,
          position: "relative",
        }}
      >
        {/* ---- the brand, on the slab ---------------------------------- */}
        <div
          style={{
            width: `${(1 - PHOTO_COL) * 100}%`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 56px",
            position: "relative",
          }}
        >
          {/* No lattice. Three faint lime rules used to run the width of this
              card, and they were there because the card had nothing else in
              it — with photographs on the trailing edge they are decoration
              competing with the work. Rendered, two of them also crossed the
              wordmark, which read as a scratch on the artwork rather than as
              a grid. */}
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 21,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: DIM,
              display: "flex",
            }}
          >
            Visual archive
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* The drawn wordmark, not the name set in a typeface. Sized by
                width with the height following the artwork's own 826:251, so
                the lettering cannot be stretched.
                No eslint-disable: this is an ImageResponse, not the DOM —
                next/image has nothing to do here and the rule knows it. */}
            <img src={WORDMARK} alt={site.name} width={MARK_W} height={MARK_H} />
            <div
              style={{
                marginTop: 22,
                fontFamily: "JetBrains Mono",
                /* 19, not 23. Five lanes is 41 characters, and JetBrains Mono
                   at 23px runs about 566px of them into a 560px column — so
                   it wrapped, and wrapped after a separator, leaving "event"
                   alone on a second line under a dangling middot. Rendered
                   and looked at, which is the only way that shows up. */
                fontSize: 19,
                letterSpacing: "0.02em",
                color: DIM,
                display: "flex",
              }}
            >
              {lanes}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderTop: "1px solid rgba(196, 242, 62, 0.28)",
              paddingTop: 22,
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex", color: DIM }}>Commissions open</div>
            <div style={{ display: "flex", color: LIME }}>{site.email}</div>
          </div>
        </div>

        {/* ---- the work ------------------------------------------------ */}
        <div
          style={{
            width: `${PHOTO_COL * 100}%`,
            height: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: GAP,
            /* Satori has no grid, so the 2x2 is a wrapping flex row with each
               frame at a fixed card-pixel box. */
          }}
        >
          {plates.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              width={plates.length === 1 ? size.width * PHOTO_COL : FRAME_W}
              height={plates.length <= 2 ? size.height : FRAME_H}
              style={{ objectFit: "cover" }}
            />
          ))}
          {/* Nothing to show is a state, not a bug — two lanes have no work
              filed yet. The column closes up and the brand block is the card,
              rather than leaving four grey holes in it. */}
          {plates.length === 0 && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                background: "rgba(196, 242, 62, 0.06)",
                borderLeft: "1px solid rgba(196, 242, 62, 0.28)",
              }}
            />
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: display, weight: 800, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}

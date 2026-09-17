import { ImageResponse } from "next/og";

import { genres, site } from "@/lib/site";
import {
  DIM,
  LIME,
  PAPER,
  SLAB,
  WORDMARK,
  WORDMARK_RATIO,
  display,
  genrePlates,
  mono,
} from "@/lib/share-card";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Five cards, all known here — built ahead so an unfurler that has never asked
 * before does not wait on a render. */
export function generateStaticParams() {
  return genres.map((g) => ({ genre: g.id }));
}

/* Same split as the site card, for the same reason — see opengraph-image.tsx
 * in the app root. Three frames rather than four: the lane's name is the
 * headline here and it needs the room. */
const PHOTO_COL = 0.4;
const GAP = 6;
const FETCH_W = Math.round(size.width * PHOTO_COL);
/* The column is always full: with three frames each takes a third of it, with
 * two a half, with one the whole thing. Dividing by a fixed three left 212px
 * of empty slab under a two-frame lane, which is the shape a lane looks like
 * the day its second gallery is filed. */
const frameHeight = (count: number) =>
  Math.round((size.height - GAP * (count - 1)) / count);

const MARK_W = 300;
const MARK_H = Math.round(MARK_W / WORDMARK_RATIO);

/**
 * The genre card is the whole point of the genre page: a link pasted into a
 * client's chat should unfurl as "Graduation photography", not as a generic
 * site title.
 *
 * It carries that lane's own galleries now — the covers the owner chose to
 * front them with — because a card headed Graduation was answering "what does
 * graduation work here look like" with no photograph at all. Same fault as the
 * site card and the same fix; the note on that one has the owner's words.
 *
 * Two of the five lanes have nothing filed (pending-task.md § 3) and get the
 * type-only card rather than borrowing another lane's frames, which would be
 * showing food under a heading that says sport.
 */
export default async function Image({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const g = genres.find((x) => x.id === genre);
  const label = (g?.label ?? "Photography").toUpperCase();
  const plates = await genrePlates(genre, 3, FETCH_W);
  const wide = plates.length === 0;

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
        <div
          style={{
            width: wide ? "100%" : `${(1 - PHOTO_COL) * 100}%`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 56px",
            position: "relative",
          }}
        >
          {/* No lattice. Three faint lime rules used to run the width of this
              card, and they were there because the card had nothing else in it — with photographs on the trailing edge they are decoration
              competing with the work. Rendered, two of them also crossed the
              wordmark, which read as a scratch on the artwork rather than as
              a grid. */}
          {/* The drawn wordmark stands where the boxed `U` used to. That box
              held a letter typeset in the display face, which was never the
              mark — and the mark it stood in for has been the brush wordmark
              since the owner supplied it. */}
          <img src={WORDMARK} alt={site.name} width={MARK_W} height={MARK_H} />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Archivo",
                /* GRADUATION is ten characters of Archivo 800 expanded, and
                 * the type column is narrower than the card now — so both
                 * steps come down with it. Measured against the longest
                 * label the genre list holds. */
                fontSize: label.length > 8 ? 64 : 88,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: PAPER,
                display: "flex",
              }}
            >
              {label}
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: "JetBrains Mono",
                fontSize: 22,
                color: DIM,
                display: "flex",
              }}
            >
              {g?.blurb ?? "Commissions open."}
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

        {/* Three frames stacked down the trailing edge — the lane's own
            galleries, in the order the archive files them. */}
        {!wide && (
          <div
            style={{
              width: `${PHOTO_COL * 100}%`,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: GAP,
            }}
          >
            {plates.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                width={FETCH_W}
                height={frameHeight(plates.length)}
                style={{ objectFit: "cover" }}
              />
            ))}
          </div>
        )}
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

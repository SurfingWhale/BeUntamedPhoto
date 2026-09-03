import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Satori cannot read the WOFF2 that next/font downloads, so the TTFs are
 * vendored under assets/. See assets/README.md. */
const syne = await readFile(join(process.cwd(), "assets/Syne-ExtraBold.ttf"));
const mono = await readFile(
  join(process.cwd(), "assets/JetBrainsMono-Regular.ttf"),
);

const SLAB = "#051C14";
const LIME = "#C4F23E";
const PAPER = "#FBFBF9";
const DIM = "#ABCFBB";

/**
 * The share card. Someone sent this link in a WhatsApp message and the
 * recipient decides in about a second whether it looks like a real practice or
 * a scrape — so the card carries the wordmark, what the work actually is, and
 * a way to reach a person, on the same slab and lattice as the site.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: SLAB,
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* The lattice, at the same 12-column rhythm as the page. */}
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${n * 25}%`,
              width: 1,
              background: "rgba(196, 242, 62, 0.16)",
            }}
          />
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: DIM,
              display: "flex",
            }}
          >
            Visual archive
          </div>
          {/* The masthead glyph, rebuilt from boxes. */}
          <div
            style={{
              width: 84,
              height: 84,
              border: `2px solid ${LIME}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Syne",
              fontSize: 46,
              color: LIME,
            }}
          >
            U
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Syne",
              /* 7 characters of Syne 800 across 1056px of usable width — 158
               * clipped the D off the right edge. */
              fontSize: 122,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: PAPER,
              display: "flex",
            }}
          >
            UNTAM<span style={{ color: LIME }}>E</span>D
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: "JetBrains Mono",
              fontSize: 27,
              letterSpacing: "0.02em",
              color: DIM,
              display: "flex",
            }}
          >
            Food, sport and event photography by {site.owner}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(196, 242, 62, 0.28)",
            paddingTop: 26,
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: DIM,
          }}
        >
          <div style={{ display: "flex" }}>Commissions open</div>
          <div style={{ display: "flex", color: LIME }}>{site.email}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Syne", data: syne, weight: 800, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}

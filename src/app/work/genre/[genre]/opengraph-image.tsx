import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { genres, site } from "@/lib/site";

export const alt = "Photography by Fauzy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const syne = await readFile(join(process.cwd(), "assets/Syne-ExtraBold.ttf"));
const mono = await readFile(join(process.cwd(), "assets/JetBrainsMono-Regular.ttf"));

const SLAB = "#051C14";
const LIME = "#C4F23E";
const PAPER = "#FBFBF9";
const DIM = "#ABCFBB";

/**
 * The genre card is the whole point of the genre page: a link pasted into a
 * client's chat should unfurl as "Graduation photography", not as a generic
 * site title. Same slab, lattice and wordmark as the site card, with the genre
 * carrying the headline.
 */
export default async function Image({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const g = genres.find((x) => x.id === genre);
  const label = (g?.label ?? "Photography").toUpperCase();

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
              color: DIM,
              display: "flex",
            }}
          >
            UNTAMED · {site.owner.toUpperCase()}
          </div>
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
              /* GRADUATION is ten characters of Syne 800 across 1056px of
               * usable width; 104 put the final N on the edge. */
              fontSize: label.length > 8 ? 92 : 132,
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
              marginTop: 24,
              fontFamily: "JetBrains Mono",
              fontSize: 26,
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

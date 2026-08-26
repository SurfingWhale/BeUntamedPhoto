import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { directory, site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Satori reads ttf, otf and woff — never woff2, which is what Google Fonts
 * hands a modern browser. The face is committed instead of fetched so the
 * card never depends on a network call at request time. */
const FONT = join(process.cwd(), "src/app/KronaOne-Regular.ttf");

const PAPER = "#fefdfc";
const INK = "#110f0d";
const ACCENT = "#bd3d00";
const MUTED = "#777471";
const RULE = "#bfbdba";

/** One corner of the registration mark, drawn with two borders. */
function Corner({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", width: 84, height: 84, ...style }} />;
}

export default async function Image() {
  const krona = await readFile(FONT);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
          position: "relative",
        }}
      >
        <Corner style={{ top: 48, left: 48, borderTop: `7px solid ${INK}`, borderLeft: `7px solid ${INK}` }} />
        <Corner style={{ top: 48, right: 48, borderTop: `7px solid ${INK}`, borderRight: `7px solid ${INK}` }} />
        <Corner style={{ bottom: 48, right: 48, borderBottom: `7px solid ${INK}`, borderRight: `7px solid ${INK}` }} />
        <Corner style={{ bottom: 48, left: 48, borderBottom: `7px solid ${INK}`, borderLeft: `7px solid ${INK}` }} />

        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            color: MUTED,
            marginBottom: 34,
            fontFamily: "Krona",
          }}
        >
          {site.mastLine.toUpperCase()}
        </div>

        <div style={{ display: "flex", fontFamily: "Krona", fontSize: 128, letterSpacing: 2, color: INK }}>
          <span>UNTAM</span>
          <span style={{ color: ACCENT }}>E</span>
          <span>D</span>
        </div>

        <div style={{ display: "flex", width: 300, height: 1, background: RULE, marginTop: 44 }} />

        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            color: MUTED,
            marginTop: 30,
            fontFamily: "Krona",
          }}
        >
          {directory.map((d) => d.looking.toUpperCase()).join("  ·  ")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Krona", data: krona, style: "normal", weight: 400 }],
    },
  );
}

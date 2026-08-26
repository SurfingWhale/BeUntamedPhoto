import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, JetBrains_Mono, Krona_One } from "next/font/google";

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { getViewer } from "@/lib/auth";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-plex",
});

/* The wordmark only. Krona One ships a single weight and no italic, so it
 * never carries running text — Fraunces still does the editorial work. */
const krona = Krona_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-krona",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Photographs and galleries — sport, food, and the frames in between.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Set the theme before first paint so the page never flashes the wrong ground. */
const THEME_BOOT = `(function(){try{var t=localStorage.getItem("untamed-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getViewer();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body
        className={`${fraunces.variable} ${plex.variable} ${jetbrains.variable} ${krona.variable}`}
      >
        <a className="u-skip" href="#main">
          Skip to content
        </a>
        <Masthead viewer={viewer} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

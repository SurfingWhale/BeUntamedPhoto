import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Syne } from "next/font/google";

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { GridLines } from "@/components/grid-lines";
import { MotionRoot } from "@/components/motion";
import { getViewer } from "@/lib/auth";
import { site } from "@/lib/site";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Photographs, galleries and creative work by Muhammad Fauzy. Sport, food, and the frames in between.",
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
        {/* Motion server-renders its initial state as an inline opacity:0, so
            without JS the scroll reveals never fire and that content would
            stay invisible. This puts it back. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={`${syne.variable} ${hanken.variable} ${jetbrains.variable}`}>
        <a className="u-skip" href="#main">
          Skip to content
        </a>
        <MotionRoot>
          <GridLines />
          <Masthead viewer={viewer} />
          {/* tabindex -1 so "Skip to content" actually moves focus here;
              without it Safari scrolls but leaves focus back in the nav. */}
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </MotionRoot>
      </body>
    </html>
  );
}

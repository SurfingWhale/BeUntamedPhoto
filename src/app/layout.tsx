import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Masthead } from "@/components/masthead";
import { Fab } from "@/components/fab";
import { Footer } from "@/components/footer";
import { MediaFade } from "@/components/media";
import { ServiceWorker } from "@/components/pwa";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

/* One webfont, for the display role only.
 *
 * The history matters, because it is why this is one file and not three.
 * tokens.css once named Syne, Hanken Grotesk and JetBrains Mono, and
 * next/font loaded all three — but the variables were declared on <body>
 * while the semantic families were built on :root, so a var() resolved where
 * it was used rather than where it was declared, none of them ever applied,
 * and the site rendered in the system stack for its whole life while three
 * woff2 files were preloaded and used by nothing. Three variable families
 * measured 99KB on the wire and were the largest non-image item on the page.
 *
 * So: the body and the metadata roles stay on the system stack. They are a
 * neutral grotesque on every platform, which is exactly what design.md asks
 * of them, and they cost nothing. Only the display role — the wordmark and
 * the headings, the thing that actually carries a brand — gets a face of its
 * own, and the reference's wordmark is unmistakably a distinct display face.
 *
 * **The face is Archivo, set expanded.** It replaced Syne on 2026-09-11, at
 * the owner's call, on sight. He was right to overrule it, and how it got
 * there is the point: design.md named Syne, and design.md named Syne from a
 * *reconstruction* of the reference rather than from the reference itself —
 * the sixth thing that document got wrong the same way. Archivo is what its
 * own first version named, before a paraphrase replaced it.
 *
 * Archivo carries a width axis, and "a bold expanded grotesque wordmark" is
 * what the reference actually shows, so this is the variable font **pinned**
 * at `wght 800 / wdth 125`, then subset. Pinning is what makes it affordable:
 * with both axes left free the subset is 72.5KB, and the display role never
 * sets more than one weight at one width. Pinned and subset it is 10.7KB —
 * within 200 bytes of the Syne it replaces, so the change costs nothing.
 *
 * `next/font/local`, not `next/font/google`: the variable source is vendored
 * under its OFL 1.1 licence and the build stays off the network. Subset to
 * Google's own `latin` range rather than a hand-picked glyph list, because
 * .reel__name and .album__title are gallery titles the owner types and the
 * face has to cover ordinary Latin or a heading falls back mid-word.
 *
 * `adjustFontFallback` is the whole CLS argument, and it is the half of the
 * old revert's reasoning that did not hold: next/font generates a
 * metric-matched fallback with size-adjust and ascent/descent overrides, so
 * "no swap and no layout shift" was never an argument against the loader.
 *
 * THE CLASS GOES ON <html>. Not <body>. tokens.css builds --font-display from
 * --font-display-face on :root, and a custom property resolves where its
 * lives. On <body> the variable is undefined at :root, --font-display
 * computes to the guaranteed-invalid value, and every descendant inherits
 * that invalidity — which is the bug above, and nothing catches it but
 * reading getComputedStyle back. `npm run measure` now does: EXPECTED_FAMILIES
 * is 2, and it fails the moment this stops applying. */
const display = localFont({
  src: "./fonts/archivo-800exp-latin.woff2",
  weight: "800",
  style: "normal",
  display: "swap",
  variable: "--font-display-face",
  /* Arial is the default and the right one here: the fallback only holds the
     box for one paint, and Archivo is a grotesque. */
  adjustFontFallback: "Arial",
});

const DESCRIPTION =
  "Graduation, brand, sport, food and event photography. Commissions open across Jakarta and beyond.";

export const metadata: Metadata = {
  /* Required for the share card: WhatsApp and every other unfurler ignore a
   * relative og:image, so these have to resolve to absolute URLs. */
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: DESCRIPTION,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "black-translucent",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* Matches the manifest, so an installed window's chrome is the slab rather
   * than a browser default that clashes with it. */
  themeColor: "#051C14",
};

/* Set the theme before first paint so the page never flashes the wrong ground. */
const THEME_BOOT = `(function(){try{var t=localStorage.getItem("untamed-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}document.documentElement.setAttribute("data-media","js")})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {/* Motion server-renders its initial state as an inline opacity:0, so
            without JS the scroll reveals never fire and that content would
            stay invisible. This puts it back. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a className="u-skip" href="#main">
          Skip to content
        </a>
        <Masthead />
        {/* tabindex -1 so "Skip to content" actually moves focus here;
            without it Safari scrolls but leaves focus back in the nav. */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <Fab />
        <ServiceWorker />
        <MediaFade />
      </body>
    </html>
  );
}

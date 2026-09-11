import type { Metadata, Viewport } from "next";

import { Masthead } from "@/components/masthead";
import { Fab } from "@/components/fab";
import { Footer } from "@/components/footer";
import { GridLines } from "@/components/grid-lines";
import { MediaFade } from "@/components/media";
import { ServiceWorker } from "@/components/pwa";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

/* No webfonts.
 *
 * tokens.css named Syne, Hanken Grotesk and JetBrains Mono, and next/font
 * loaded all three — but the variables were declared on <body> while the
 * semantic families were built on :root, so they never once applied and the
 * site rendered in the system stack for its whole life. Fixing the variable
 * scope made them appear, and the owner's answer was immediate: the system
 * face was what he wanted. His call, and it is also the cheaper one — three
 * variable families were 99KB on the wire, measured, and they were the single
 * largest non-image item on every page. Native faces are already on the
 * device, so there is no download, no swap and no layout shift.
 *
 * The families now live entirely in tokens.css. Putting a webfont back means
 * adding the loader here and pointing --font-display/--font-body/--font-mono
 * at it, with the class on <html> and not on <body>. */

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
      <body>
        <a className="u-skip" href="#main">
          Skip to content
        </a>
        <GridLines />
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

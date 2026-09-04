import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Syne } from "next/font/google";

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { GridLines } from "@/components/grid-lines";
import { MediaFade } from "@/components/media";
import { ServiceWorker } from "@/components/pwa";
import { getViewer } from "@/lib/auth";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

/* Only the weights the stylesheet actually asks for. Traced rule by rule,
 * including the ones that inherit their family: .mark--bold and .rail__no set
 * 700 without naming a family and land on Hanken and JetBrains respectively.
 * A weight nothing uses is dead bytes; dropping one something uses is worse,
 * because the browser then synthesises a fake bold. */
const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700", "800"],
  variable: "--font-syne",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-jetbrains",
});

const DESCRIPTION =
  "Graduation, brand, sport, food and event photography by Fauzy. Commissions open across Jakarta and beyond.";

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
        <GridLines />
        <Masthead viewer={viewer} />
        {/* tabindex -1 so "Skip to content" actually moves focus here;
            without it Safari scrolls but leaves focus back in the nav. */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <ServiceWorker />
        <MediaFade />
      </body>
    </html>
  );
}

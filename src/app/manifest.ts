import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Installable, but deliberately not an offline app. `display: standalone` plus
 * the icon set is what puts the mark on a home screen; the service worker in
 * public/sw.js caches only content-hashed static assets, so an installed copy
 * still fetches every page from the network and can never show a stale gallery.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description:
      "Photographs, galleries and creative work by Fauzy. Sport, food, and the frames in between.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#051C14",
    theme_color: "#051C14",
    categories: ["photography", "portfolio"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

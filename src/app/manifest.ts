import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Installing the archive to a home screen. iOS ignores these icons entirely
 * and reads apple-icon.png instead, which is why both exist.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ece7dd",
    theme_color: "#ece7dd",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android crops a maskable icon to its own shape, so this one holds a
      // wider safe zone than the others.
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

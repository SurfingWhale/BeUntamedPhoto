"use client";

import Link from "next/link";

import { useViewer } from "@/components/use-viewer";

/**
 * A standing shortcut into the darkroom, for the owner only.
 *
 * The urgent case is a phone: a shoot just finished and a frame needs to go up
 * from wherever he is standing. Reaching the uploader meant home, then the nav
 * rail, then the darkroom, then the gallery, then past every plate already in
 * it. This is one tap from any page.
 *
 * It lands on the darkroom index rather than the open gallery's uploader.
 * Knowing which gallery is on screen would mean passing the path down from the
 * proxy, and that file is the one refreshing the auth token — a tap is not
 * worth reaching into it. The gallery list is the first thing on the darkroom,
 * so it is two taps from anywhere.
 *
 * It asks from the browser, and that is the whole point. This sits in the root
 * layout, so when it asked on the server every page in the site read a cookie
 * to draw it — and a page that reads a cookie is rendered per request and sent
 * `no-store`. One button for one person was holding the entire public archive
 * out of every cache. Appearing a moment late costs nothing: it is pinned to
 * the corner, so nothing reflows around it, and the darkroom it opens checks
 * again on the server anyway.
 */
export function Fab() {
  const viewer = useViewer();
  if (!viewer?.isOwner) return null;

  return (
    <Link className="fab" href="/darkroom" aria-label="Open the darkroom to add plates">
      <span className="fab__mark" aria-hidden="true">
        +
      </span>
      <span className="fab__label">Add plates</span>
    </Link>
  );
}

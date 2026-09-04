import Link from "next/link";

import { getViewer } from "@/lib/auth";

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
 * middleware, and that file is the one refreshing the auth token — a tap is
 * not worth reaching into it. The gallery list is the first thing on the
 * darkroom, so it is two taps from anywhere.
 *
 * getViewer is deduped per request, so this costs no extra query.
 */
export async function Fab() {
  const viewer = await getViewer();
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

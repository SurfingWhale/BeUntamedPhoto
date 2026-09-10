"use client";

import { useEffect, useState } from "react";

export type Viewer = { id: string; displayName: string; isOwner: boolean } | null;

/**
 * Who is signed in, asked once per mount.
 *
 * Signed out is the starting state, and on prerendered markup it is the only
 * honest one: HTML shared by every reader cannot know who will read it. So a
 * control renders in its signed-out form and corrects itself if an answer
 * comes back — which means anything that changes shape between the two states
 * has to reserve its space, or the page moves under the reader.
 */
export function useViewer(): Viewer {
  const [viewer, setViewer] = useState<Viewer>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((v: Viewer) => {
        if (live) setViewer(v);
      })
      .catch(() => {
        // Offline, or the route is unreachable. Signed out is the safe reading:
        // everything it would unlock is checked again on the server anyway.
        if (live) setViewer(null);
      });
    return () => {
      live = false;
    };
  }, []);

  return viewer;
}

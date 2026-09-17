"use client";

import { useEffect, useState } from "react";

export type Viewer = { id: string; displayName: string; isOwner: boolean } | null;

/**
 * One answer, shared by everything that asks.
 *
 * The hook used to fetch on every mount, and the number of mounts is not one.
 * Six components read it — the masthead, the Fab, `SignedIn`, `SignedOut`,
 * `NotesGate` and `NotesPanel` — and a gallery page renders all six: the
 * masthead, the Fab, the guestbook's gate, its panel, and a `SignedIn`/
 * `SignedOut` pair in the heading. So opening one gallery fired six requests
 * for the same sentence, and `/api/me` is `force-dynamic` and answers
 * `private, no-store`, so not one of them could be served from a cache. Six
 * round trips, one answer, on the arrival a visitor makes first.
 *
 * The fix is a module-level promise rather than a context. A provider would
 * work and would also mean wrapping the root layout in a client component,
 * which is the move that cost this site its prerender once already — `<Fab />`
 * in the layout turned the whole public tree back into `no-store` to draw one
 * button for one person. A promise held beside the hook needs no wrapper: the
 * first mount starts the request, every later mount awaits the same one, and
 * components stay independent.
 *
 * It is cached for the life of the document on purpose. The session does not
 * change under a reader without a navigation that reloads — signing in
 * redirects, signing out is a POST that redirects — and `refreshViewer()` is
 * here for anything that ever needs to ask again.
 */
let cached: Promise<Answer> | null = null;

/**
 * The answer, and whether it is one.
 *
 * `null` is the correct reply for a reader with no session, and it is also
 * what a dropped request leaves behind — so a promise of `Viewer` alone cannot
 * say which happened, and caching it would either hold a network failure for
 * the life of the document or re-ask on every mount for every signed-out
 * visitor, who are almost all of them. `answered` is the difference: a reply
 * from the route is kept whatever it says, and a failure is not.
 */
type Answer = { answered: boolean; viewer: Viewer };

function ask(): Promise<Answer> {
  return fetch("/api/me")
    .then(async (r) =>
      r.ok
        ? { answered: true, viewer: (await r.json()) as Viewer }
        : { answered: false, viewer: null },
    )
    .catch(() => ({
      // Offline, or the route is unreachable. Signed out is the safe reading:
      // everything it would unlock is checked again on the server anyway.
      answered: false,
      viewer: null,
    }));
}

function viewerPromise(): Promise<Answer> {
  if (!cached) {
    const pending = ask();
    cached = pending;
    /* A reader who was offline for the first paint gets a real answer on the
     * next mount rather than being told "signed out" for the rest of the
     * document's life. */
    void pending.then((a) => {
      if (!a.answered && cached === pending) cached = null;
    });
  }
  return cached;
}

/** Drops the shared answer, so the next mount asks again. */
export function refreshViewer(): void {
  cached = null;
}

/**
 * Who is signed in.
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
    void viewerPromise().then((a) => {
      if (live) setViewer(a.viewer);
    });
    return () => {
      live = false;
    };
  }, []);

  return viewer;
}

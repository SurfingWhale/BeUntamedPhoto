"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * The other missing door.
 *
 * `lib/gallery.ts` throws on purpose — an unreadable archive has to fail loudly
 * rather than render an empty site at 200, which is the argument written up in
 * that file and in CLAUDE.md. The throwing was deliberate; where it *landed*
 * was not. With no error boundary anywhere under `app/`, a failed query left
 * the framework's built-in error screen: a stack trace in development and a
 * bare unstyled line in production, either way with no masthead, no footer and
 * nothing to click.
 *
 * So this is the other half of that decision. The page still fails — nothing
 * here pretends the archive was read — but it fails inside the site, with the
 * nav rail above it and two ways onward: try again, because a dropped
 * connection to the database is the likeliest cause, or go somewhere that
 * works.
 *
 * The prop is `retry`, and it is not the `reset` this was first written with.
 * They are different functions in this version and the docs are explicit about
 * which to reach for: `retry()` re-fetches and re-renders the boundary's
 * children, `reset()` clears the error state and re-renders them *without*
 * re-fetching. For the failure this page actually catches — a query that did
 * not come back — `reset` would replay the same render against the same
 * absent data and land on this page again. A button that cannot work is worse
 * than no button. See node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/error.md.
 *
 * A boundary at the root catches every route below it. `global-error.tsx`
 * handles the one case this cannot — a throw in the root layout itself, which
 * takes the masthead and footer down with it.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // The server log has the real thing; this is the browser's copy, so an
    // owner looking at a phone can read the digest back.
    console.error("[beuntamed] render failed:", error.message, error.digest);
  }, [error]);

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">error · the page did not finish</p>
        <h1 className="page__title">
          That didn&rsquo;t <em>load</em>.
        </h1>
        <p className="fold-text__body">
          Something between here and the archive failed — usually the database,
          usually briefly. Nothing is lost and nothing was changed. Try it
          again; if it happens twice, it is worth knowing about.
        </p>
      </section>

      <section className="fold-text fold-text--tight">
        <div>
          <button className="btn" type="button" onClick={() => retry()}>
            Try again
          </button>
        </div>
        <p className="field__help">
          {error.digest ? `Reference ${error.digest}.` : "No reference for this one."}
        </p>
        <p className="fold-text__body">
          Or start from{" "}
          <Link className="link" href="/">
            the archive
          </Link>{" "}
          or{" "}
          <Link className="link" href="/work">
            the galleries
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

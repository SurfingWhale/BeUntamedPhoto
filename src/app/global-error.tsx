"use client";

/**
 * The floor under everything.
 *
 * `error.tsx` catches a throw inside a page and keeps the masthead and footer
 * around it. This catches a throw in the root layout itself, which takes those
 * with it — so this file supplies its own `<html>` and `<body>`, because the
 * ones it would have inherited are the thing that failed.
 *
 * Three constraints come straight from the docs rather than from taste, and
 * each one rules out the obvious version of this page. See
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/
 * error.md § Global Error.
 *
 *   1. **No global styles.** This file replaces the root layout, so
 *      `globals.css` is not loaded and neither is the font. Importing the
 *      stylesheet here would be worse than not having it: `tokens.css` builds
 *      `--font-display` out of a variable `next/font` puts on `<html>` through
 *      that layout, and a `var()` with nothing behind it is invalid at
 *      computed-value time — the exact failure CLAUDE.md documents. Half the
 *      sheet would resolve to nothing. So everything here is inline and the
 *      literal colours are deliberate: a page shown when the app is broken
 *      cannot depend on the app.
 *
 *   2. **No app theme.** The theme is a `data-theme` attribute the boot script
 *      in the root layout sets, and that script is not running. `prefers-
 *      color-scheme` is the only signal left, so the style block below answers
 *      it directly rather than shipping a light page to a dark browser.
 *
 *   3. **No `metadata` export.** Error boundaries are Client Components, which
 *      cannot export metadata. React's `<title>` is the documented substitute
 *      and is what this uses.
 *
 * `retry` is offered, not `reset`: the same reasoning as error.tsx, where it is
 * written out.
 */
const CSS = `
  :root { color-scheme: light dark; --g: #F4F2ED; --ink: #12100C; --mid: #3A362E; --quiet: #6B6659; }
  @media (prefers-color-scheme: dark) {
    :root { --g: #051C14; --ink: #F4F2ED; --mid: #C9C4B8; --quiet: #8A8576; }
  }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    padding: 2rem max(1.25rem, env(safe-area-inset-left, 0px));
    background: var(--g); color: var(--ink);
    font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  main { max-width: 34rem; }
  .eyebrow {
    margin: 0 0 1rem; color: var(--quiet);
    font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.14em; text-transform: uppercase;
  }
  h1 {
    margin: 0 0 1rem; letter-spacing: -0.02em;
    font: 800 clamp(1.75rem, 1.3rem + 2vw, 2.75rem)/1.05 system-ui, sans-serif;
  }
  p { margin: 0 0 1.5rem; color: var(--mid); }
  .go { color: var(--ink); font-weight: 600; }
  .ref { margin: 0; font-size: 13px; color: var(--quiet); }
  button {
    font: inherit; color: var(--g); background: var(--ink);
    border: 0; padding: 0.7rem 1.2rem; cursor: pointer;
  }
`;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <style>{CSS}</style>
        <main>
          <p className="eyebrow">error · the archive did not start</p>
          <h1>Something broke before the page did.</h1>
          <p>
            This is not a missing gallery — the site itself failed to load.
            Trying again usually settles it. Nothing you did caused it and
            nothing was lost.
          </p>
          <p>
            <button type="button" onClick={() => retry()}>
              Try again
            </button>
          </p>
          <p>
            {/* A real navigation, not a router push, and the lint rule is
                wrong about this one case: `<Link>` hands the move to the
                client router, and the root layout that mounts it is exactly
                what failed here. A full load is the point — it rebuilds the
                document this page is standing in for. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="go" href="/">
              Or start from the archive &rarr;
            </a>
          </p>
          <p className="ref">
            {error.digest
              ? `Reference ${error.digest} — worth quoting if you report it.`
              : "No reference was recorded for this one."}
          </p>
        </main>
      </body>
    </html>
  );
}

import Link from "next/link";

import { nav, site } from "@/lib/site";

/**
 * The 404, and the reason this file has to exist.
 *
 * `notFound()` is called from five places — a slug with no gallery, a page
 * number past the end of one, `/work/[slug]/p/0`, a genre that is not one of
 * the five, and the darkroom's own album route. Until now every one of them
 * landed on the framework's built-in 404: unstyled, wordless, no masthead, no
 * footer, and nothing to click. A visitor who mistyped a gallery name, or
 * followed a link to a set that has since been renamed, had reached the end of
 * the site. That is the dead end, and there were five doors into it.
 *
 * A file here fixes all five at once, because every route under `app/` falls
 * back to the nearest `not-found` above it and this is the root. It is wrapped
 * by the root layout, so the masthead, the nav rail and the footer come back
 * with it — the ways onward are already on the page, and these links are the
 * ones worth saying out loud.
 *
 * Nothing here reads the database. A 404 that depends on a query is a 404 that
 * can itself fail, and this page is what the site falls back *to*. So it is
 * static, the routes are read from `nav` rather than typed out again, and it
 * cannot go stale or throw.
 *
 * No `metadata` export, and not by omission. `not-found.js` takes no props and
 * supports no metadata in this version — that is `global-not-found.js`, which
 * is a different (and experimental) file — so an export here would be a title
 * nobody sets and a claim nobody checks. `robots: noindex` would be redundant
 * besides: Next injects it for anything answering 404.
 */
export default function NotFound() {
  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">404 · no plate at this address</p>
        <h1 className="page__title">
          Nothing <em>filed</em> here.
        </h1>
        <p className="fold-text__body">
          The address is good but the archive has nothing under it — a gallery
          that was renamed, a page number past the last plate, or a typo. The
          work is all still here; it is one of these.
        </p>
      </section>

      <nav className="page__pad" aria-label="Where to go instead">
        <div className="chips">
          {nav.map((item) => (
            <Link className="chip" key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <section className="fold-text fold-text--tight">
        <div className="head">
          <h2 className="head__title">Looking for a particular set?</h2>
          <p className="head__sub">
            Every gallery is listed on one page, newest work first.{" "}
            <Link className="link" href="/work">
              Go to the galleries →
            </Link>
          </p>
        </div>
        <p className="fold-text__body">
          If a link brought you here, it is worth telling me it is broken —{" "}
          <a className="link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
      </section>
    </div>
  );
}

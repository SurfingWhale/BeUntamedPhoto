import Link from "next/link";

import { elsewhere, site } from "@/lib/site";

/* Ft5 · Statement — one closing line dominates; wordmark sits beneath it. */
export function Footer() {
  return (
    <footer className="foot">
      <p className="u-mono">[{site.name} · visual archive]</p>

      <p className="foot__statement">
        Shot on purpose, not on <em>schedule</em>.
      </p>

      <p className="foot__ps">
        The guestbook is open, and I read every note. Say hello at{" "}
        <a className="link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>

      <p className="foot__wordmark" aria-hidden="true">
        {site.name}
      </p>

      <div className="foot__row">
        <span>© {new Date().getUTCFullYear()} {site.name}</span>
        {elsewhere.map((place) => (
          <a
            key={place.href}
            className="foot__link"
            href={place.href}
            target="_blank"
            rel="noreferrer"
          >
            {place.name}
          </a>
        ))}
        <a className="foot__link" href={site.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <Link className="foot__link" href="/notes">
          Guestbook
        </Link>
      </div>
    </footer>
  );
}

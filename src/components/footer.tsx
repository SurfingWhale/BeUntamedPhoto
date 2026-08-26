import Link from "next/link";

import { elsewhere, site } from "@/lib/site";

/* Ft6 · Letter close — the page closes like a letter, not a sitemap. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__inner">
        <p className="foot__close">
          Thanks for looking. Come back when the light changes.
          <br />
          <span className="foot__sign">— {site.name}</span>
        </p>

        <p className="foot__ps">
          P.S. — the guestbook is open, and I read every note. Say hello at{" "}
          <a className="link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>

        <div className="foot__row">
          <span>
            © {new Date().getUTCFullYear()} {site.name}
          </span>
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
          <Link className="foot__link" href="/notes">
            Guestbook
          </Link>
        </div>
      </div>
    </footer>
  );
}

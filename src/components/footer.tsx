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
          P.S. — the guestbook is open, and I read every note.
          {site.email ? (
            <>
              {" "}
              Say hello at{" "}
              <a className="link" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              .
            </>
          ) : (
            <>
              {" "}
              <Link className="link" href="/notes">
                Leave one
              </Link>
              .
            </>
          )}
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
        <div className="foot__cols">
          <div className="foot__col">
            <h3>Archive</h3>
            <Link href="/work">Galleries</Link>
            <Link href="/notes">Guestbook</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="foot__col">
            <h3>Elsewhere</h3>
            {elsewhere.map((place) => (
              <a key={place.href} href={place.href} target="_blank" rel="noreferrer">
                {place.name} ↗
              </a>
            ))}
          </div>
          <div className="foot__col">
            <h3>Get in</h3>
            <Link href="/enter">Sign in</Link>
            <Link href="/notes">Leave a note</Link>
          </div>
        </div>

        <p className="foot__mark" aria-hidden="true">
          {site.name}
        </p>
      </div>
    </footer>
  );
}

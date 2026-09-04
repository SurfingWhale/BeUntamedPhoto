import Link from "next/link";

import { genreLabel, site } from "@/lib/site";

/**
 * The way out of a gallery.
 *
 * Walking the site as a visitor turned this up: an album page offered "All
 * galleries" and "Sign in" and nothing else. Someone arrives from a link in a
 * message, scrolls thirteen frames of exactly the work they wanted, and the
 * page has no way for them to say so. That is the one thing the site exists to
 * make easy.
 *
 * Placed after the plates, because before them it is an interruption and this
 * only earns attention once the pictures have.
 */
export function Commission({
  genre,
  /** Set on the genre page itself, where "more of this" is where you are. */
  atGenre = false,
}: {
  genre?: string;
  atGenre?: boolean;
}) {
  const label = genre ? genreLabel(genre).toLowerCase() : null;

  return (
    <section className="commission">
      <p className="u-mono">Commissions</p>
      <p className="commission__line">
        Want {label ? `${label} work` : "something"} like this?
      </p>
      <p className="fold-text__body">
        Send the date, the place, and roughly what the pictures are for.
        I&rsquo;ll come back with what&rsquo;s possible and what it costs.
      </p>
      <p className="commission__acts">
        <a className="btn" href={`mailto:${site.email}`}>
          {site.email} →
        </a>
        {genre && !atGenre && (
          <Link className="link" href={`/work/genre/${genre}`}>
            More {label} work
          </Link>
        )}
      </p>
    </section>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

import { PhotoFold } from "@/components/photo-fold";
import { getFeatured } from "@/lib/gallery";
import { elsewhere, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `${site.owner} — graduation, brand, sport, food and event photography. Commissions open.`,
};

export default async function AboutPage() {
  const featured = await getFeatured(2);

  return (
    <div className="page">
      <section className="fold-text fold-text--tight">
        <p className="u-mono">About</p>
        <h1 className="page__title">
          {site.owner}, <em>working</em>.
        </h1>
        <div>
          <p className="fold-text__body">
            Graduations — the ceremony, the portraits, the family afterwards.
            Brand work — product, campaign and founder frames shot to a brief.
            Sport — the half-second before the point ends, the body already
            committed. Food — plated, steaming, close enough to read the
            texture. And events: the room as it actually was, not as it was
            posed.
          </p>
          <p className="fold-text__body">
            The work is mostly patience. I&rsquo;d rather wait out the arranged
            version of a moment than direct one into place, which means I shoot
            long and keep less. What you see in these galleries is what survived
            that edit.
          </p>
          <p className="fold-text__body">
            I don&rsquo;t retouch much. If the light was wrong, the frame was
            wrong, and there&rsquo;s another one coming.
          </p>
        </div>
      </section>

      <div className="plinth">
        <PhotoFold photo={featured[0]} index={0} fallbackLabel="working portrait" />
      </div>

      <section className="fold-text">
        <div className="head">
          <h2 className="head__title">Deeper portfolios</h2>
          <p className="head__sub">
            Two genres have enough work for their own site. Booked from here
            either way.
          </p>
        </div>
        <div className="elsewhere">
          {elsewhere.map((place) => (
            <a
              key={place.href}
              className="elsewhere__row"
              href={place.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="elsewhere__name">{place.name}</span>
              <span className="elsewhere__what">{place.what}</span>
              <span className="elsewhere__go">{place.go} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <div className="plinth">
        <PhotoFold photo={featured[1]} index={1} fallbackLabel="on assignment" />
      </div>

      <section className="fold-text fold-text--tight">
        <div className="head">
          <h2 className="head__title">Commissions</h2>
          <p className="head__sub">
            Open for food, sport and event work.
          </p>
        </div>
        <p className="fold-text__body">
          Send the date, the location, and roughly what the pictures are for —
          a graduation, a menu, a product drop, a team, a launch. I&rsquo;ll
          come back with what&rsquo;s possible and what it costs. If it&rsquo;s
          not something I&rsquo;m the right person for, I&rsquo;ll say so.
        </p>
        <p>
          <a className="btn" href={`mailto:${site.email}`}>
            {site.email} →
          </a>
        </p>
        <div className="foot__row" style={{ paddingBottom: "var(--space-xl)" }}>
          <Link className="foot__link" href="/work">
            See the galleries
          </Link>
          <Link className="foot__link" href="/notes">
            Guestbook
          </Link>
        </div>
      </section>
    </div>
  );
}

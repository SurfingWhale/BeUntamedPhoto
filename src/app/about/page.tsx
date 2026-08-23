import Link from "next/link";
import type { Metadata } from "next";

import { PhotoFold } from "@/components/photo-fold";
import { getFeatured } from "@/lib/gallery";
import { elsewhere, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `${site.owner} — data analyst by trade, photographer by habit.`,
};

export default async function AboutPage() {
  const featured = await getFeatured(2);

  return (
    <div className="page">
      <section className="fold-text fold-text--tight">
        <p className="u-mono">About</p>
        <h2 className="page__title">
          {site.owner}, <em>working</em>.
        </h2>
        <div>
          <p className="fold-text__body">
            Two disciplines, one habit. By trade I&rsquo;m a data analyst with an
            accounting background — ledgers, forecasts, and the long argument
            about what a number actually means. With a camera it&rsquo;s the same
            work at a different shutter speed: wait for the thing to reveal its
            shape, then take the frame.
          </p>
          <p className="fold-text__body">
            Most of what I shoot falls into two piles. Sport — the half-second
            before the point ends, the body already committed. And food —
            plated, steaming, photographed close enough that you can read the
            texture. Everything that fits neither stays here, unfiled.
          </p>
          <p className="fold-text__body">
            I don&rsquo;t retouch much. If the light was wrong, the frame was
            wrong, and there&rsquo;s another one coming.
          </p>
        </div>
      </section>

      <PhotoFold photo={featured[0]} index={0} fallbackLabel="working portrait" />

      <section className="fold-text">
        <div className="head">
          <h2 className="head__title">Where the rest of it lives</h2>
          <p className="head__sub">
            Each site holds one part of the practice.
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

      <PhotoFold photo={featured[1]} index={1} fallbackLabel="on assignment" />

      <section className="fold-text fold-text--tight">
        <div className="head">
          <h2 className="head__title">Get in touch</h2>
          <p className="head__sub">
            Open for commissions, collaboration, or a conversation about light.
          </p>
        </div>
        <div className="foot__row" style={{ paddingBottom: "var(--space-xl)" }}>
          <a className="foot__link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <a className="foot__link" href={site.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <Link className="foot__link" href="/notes">
            Guestbook
          </Link>
        </div>
      </section>
    </div>
  );
}

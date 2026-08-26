import Link from "next/link";
import type { Metadata } from "next";

import { PhotoFold } from "@/components/photo-fold";
import { getFeatured } from "@/lib/gallery";
import { directory, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `${site.byline} — photographer. Sport, food, and the frames in between.`,
};

export default async function AboutPage() {
  const featured = await getFeatured(2);

  return (
    <div className="page">
      <section className="fold-text fold-text--tight">
        <p>
          <span className="u-mono u-mono--block">About</span>
        </p>
        <h2 className="page__title">
          {site.byline}, <em>working</em>.
        </h2>
        <div>
          <p className="fold-text__body">
            I photograph two things properly and everything else by accident.
            Sport — the half-second before the point ends, the body already
            committed. And food — plated, steaming, close enough that you can
            read the texture. Whatever fits neither stays here, unfiled.
          </p>
          <p className="fold-text__body">
            Most of it is waiting. Hold still, let the thing forget you are
            there, take the frame when it stops pretending. That is the whole
            method, and it does not get easier.
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
            Sport and food each have their own ground.
          </p>
        </div>
        <div className="elsewhere">
          {directory.map((place) => (
            <a
              key={place.href}
              className="elsewhere__row"
              href={place.href}
              target={place.external ? "_blank" : undefined}
              rel={place.external ? "noreferrer" : undefined}
            >
              <span className="elsewhere__looking">{place.looking}</span>
              <span className="elsewhere__name">{place.name}</span>
              <span className="elsewhere__what">{place.what}</span>
              <span className="elsewhere__go">
                {place.go} {place.external ? "↗" : "→"}
              </span>
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
            The guestbook reaches me — sign in and leave a line.
          </p>
        </div>
        <div className="foot__row" style={{ paddingBottom: "var(--space-xl)" }}>
          {site.email && (
            <a className="foot__link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          )}
          <Link className="foot__link" href="/notes">
            Guestbook
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

import { PhotoFold } from "@/components/photo-fold";
import { getFeatured } from "@/lib/gallery";
import { directory } from "@/lib/site";

export const dynamic = "force-dynamic";

const FALLBACK_LABELS = [
  "the opening frame",
  "sport, mid-motion",
  "the table, still warm",
  "between assignments",
];

export default async function HomePage() {
  const featured = await getFeatured(4);

  return (
    <div className="page">
      {/* Fold one — the photograph speaks before the page does. */}
      <PhotoFold
        photo={featured[0]}
        index={0}
        size="tall"
        priority
        fallbackLabel={FALLBACK_LABELS[0]}
      />

      <section className="fold-text fold-text--tight reveal" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="fold-text__lede">
          I photograph the <em>half-second</em> before a thing is over.
        </p>
        <div>
          <p className="fold-text__body">
            Most of the work is waiting. For the light to commit, for a body to
            stop pretending it isn&rsquo;t tired, for the moment a thing gives
            itself away. The frame is the easy part.
          </p>
          <p className="fold-text__body">
            Two piles, mostly — sport and food — and each has its own ground to
            stand on. Whatever belongs to neither stays here.
          </p>
        </div>
        <p>
          <Link className="link" href="/work">
            Open the galleries →
          </Link>
        </p>
      </section>

      <PhotoFold photo={featured[1]} index={1} fallbackLabel={FALLBACK_LABELS[1]} />

      {/* The signpost. Someone arriving should know within one screen where
          their thing lives, so the subject leads and the site name follows. */}
      <section className="fold-text fold-text--wide reveal" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="head">
          <h2 className="head__title">Looking for something in particular?</h2>
          <p className="head__sub">Sport and food have their own ground. This is the middle.</p>
        </div>
        <div className="elsewhere">
          {directory.map((place) =>
            place.external ? (
              <a
                key={place.href}
                className="elsewhere__row"
                href={place.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="elsewhere__looking">{place.looking}</span>
                <span className="elsewhere__name">{place.name}</span>
                <span className="elsewhere__what">{place.what}</span>
                <span className="elsewhere__go">{place.go} ↗</span>
              </a>
            ) : (
              <Link key={place.href} className="elsewhere__row" href={place.href}>
                <span className="elsewhere__looking">{place.looking}</span>
                <span className="elsewhere__name">{place.name}</span>
                <span className="elsewhere__what">{place.what}</span>
                <span className="elsewhere__go">{place.go} →</span>
              </Link>
            ),
          )}
        </div>
      </section>

      <PhotoFold photo={featured[2]} index={2} fallbackLabel={FALLBACK_LABELS[2]} />

      <section className="fold-text reveal" style={{ "--i": 2 } as React.CSSProperties}>
        <h2 className="head__title">How the archive is kept</h2>
        <div>
          <p className="fold-text__body">
            Galleries are ordered, not curated to death. Some are open to
            everyone. A few are held back — client work before it runs, frames
            I&rsquo;m still arguing with — and those open once you&rsquo;re signed in.
          </p>
          <p className="fold-text__body">
            Signing in also opens the guestbook. No mailing list, no newsletter,
            no follow-up. Just a way to leave a note on something you saw.
          </p>
        </div>
        <p>
          <Link className="link" href="/enter">
            Sign in for the full archive →
          </Link>
        </p>
      </section>

      <PhotoFold photo={featured[3]} index={3} fallbackLabel={FALLBACK_LABELS[3]} />
    </div>
  );
}

import Link from "next/link";

import { Marquee } from "@/components/marquee";
import { PhotoFold } from "@/components/photo-fold";
import { Plate } from "@/components/plate";
import { SectionHead } from "@/components/section-head";
import { getAlbums, getCovers, getFeatured } from "@/lib/gallery";
import { plate } from "@/lib/format";
import { directory, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const FALLBACK_LABELS = [
  "the opening frame",
  "sport, mid-motion",
  "the table, still warm",
  "between assignments",
];

/** Galleries shown on the home page before the index takes over. */
const PREVIEW = 3;

export default async function HomePage() {
  const [featured, albums] = await Promise.all([getFeatured(4), getAlbums()]);
  const preview = albums.slice(0, PREVIEW);
  const covers = await getCovers(preview.map((a) => a.id));

  const ticker = [
    ...directory.map((d) => d.looking),
    "frames, not feeds",
    "an ordered archive",
  ];

  return (
    <div className="page">
      {/* The photograph speaks before the page does. */}
      <PhotoFold
        photo={featured[0]}
        index={0}
        size="hero"
        priority
        fallbackLabel={FALLBACK_LABELS[0]}
        eyebrow={site.mastLine}
      >
        I photograph the <em>half-second</em> before a thing is over.
      </PhotoFold>

      <Marquee items={ticker} />

      <section className="statement reveal" style={{ "--i": 0 } as React.CSSProperties}>
        <span className="u-mono u-mono--block">The habit</span>
        <p className="statement__body">
          Most of the work is waiting. For the light to commit, for a body to
          stop pretending it isn&rsquo;t tired, for the moment a thing gives
          itself away.
        </p>
        <p className="statement__note">
          The frame is the easy part. Two piles, mostly — sport and food — and
          each has its own ground to stand on. Whatever belongs to neither
          stays here, in order and unsorted.
        </p>
      </section>

      <PhotoFold photo={featured[1]} index={1} fallbackLabel={FALLBACK_LABELS[1]} />

      {/* Recent galleries, then the index for the rest. */}
      <section className="page__pad reveal" style={{ "--i": 1 } as React.CSSProperties}>
        <SectionHead
          eyebrow="Latest"
          title="Out of the darkroom"
          count={`${albums.length} ${albums.length === 1 ? "gallery" : "galleries"}`}
          action={{ label: "All galleries", href: "/work" }}
        />
      </section>

      {preview.length > 0 && (
        <div className="albums albums--row">
          {preview.map((album, i) => {
            const cover = covers.get(album.id);
            return (
              <article className="album" key={album.id}>
                <Link className="album__media" href={`/work/${album.slug}`}>
                  {cover?.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.thumbUrl}
                      alt={cover.caption ?? album.title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <Plate no={plate(i)} label="no cover yet" />
                  )}
                  <span className="album__badges">
                    <span className="album__badge">{album.year ?? "—"}</span>
                    {album.visibility === "members" && (
                      <span className="album__badge album__badge--held">
                        ◆ held back
                      </span>
                    )}
                  </span>
                </Link>
                <div className="album__meta">
                  <h3 className="album__title">
                    <Link href={`/work/${album.slug}`}>{album.title}</Link>
                  </h3>
                </div>
                <p className="album__sub">
                  {album.subtitle ?? album.place ?? "unfiled"}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Chips laid over a frame — every one goes to a real gallery. */}
      <PhotoFold
        photo={featured[2]}
        index={2}
        fallbackLabel={FALLBACK_LABELS[2]}
        chips={albums.slice(0, 8).map((a) => ({
          label: a.title,
          href: `/work/${a.slug}`,
        }))}
      />

      {/* The signpost. Someone arriving should know within one screen where
          their thing lives, so the subject leads and the site name follows. */}
      <section className="page__pad reveal" style={{ "--i": 2 } as React.CSSProperties}>
        <SectionHead
          eyebrow="Elsewhere"
          title="Looking for something in particular?"
          count="Three places"
        />
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

      <section className="fold-text reveal" style={{ "--i": 3 } as React.CSSProperties}>
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

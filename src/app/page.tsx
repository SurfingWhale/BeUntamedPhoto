import Link from "next/link";

import { PhotoFold } from "@/components/photo-fold";
import { Plate } from "@/components/plate";
import { getAlbums, getCovers, getFeatured } from "@/lib/gallery";
import { plate } from "@/lib/format";
import { elsewhere, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const FALLBACK_LABELS = ["the opening frame", "between assignments"];

/* Portfolio Grid · low density — hero fold, three asymmetric tiles, one
 * forest-green band carrying the lane index, one closing fold. Five blocks,
 * not seven; the negative space is the design (design.md § 11). */
export default async function HomePage() {
  const [featured, albums] = await Promise.all([getFeatured(2), getAlbums()]);
  const shown = albums.slice(0, 3);
  const covers = await getCovers(shown.map((a) => a.id));

  return (
    <div className="page">
      {/* H6 · photographic fold — the photograph speaks before the page does. */}
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
        <p className="fold-text__body">
          I&rsquo;m {site.owner} — a data analyst by trade, which is a longer way of
          saying I spend my days looking for the moment a pattern gives itself
          away. A camera turned out to be the same habit pointed at the world:
          hold still, wait, take the frame when it stops pretending.
        </p>
      </section>

      {/* Portfolio Grid — three tiles, irregular spans, deliberate gaps. */}
      {shown.length > 0 && (
        <section className="grid-band">
          <div className="head">
            <p className="u-mono">01 — Selected</p>
            <h2 className="head__title">Recent galleries</h2>
          </div>

          <div className="albums albums--few">
            {shown.map((album, i) => {
              const cover = covers.get(album.id);
              return (
                <article
                  className="album reveal"
                  key={album.id}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <Link className="album__media" href={`/work/${album.slug}`}>
                    {cover?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover.url}
                        alt={cover.caption ?? album.title}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ) : (
                      <Plate no={plate(i)} label="no cover yet" />
                    )}
                  </Link>
                  <div className="album__meta">
                    <h3 className="album__title">
                      <Link href={`/work/${album.slug}`}>{album.title}</Link>
                    </h3>
                    <span className="album__year u-tabular">{album.year ?? "—"}</span>
                  </div>
                  <p className="album__sub">{album.subtitle ?? album.place ?? "unfiled"}</p>
                  {album.visibility === "members" && (
                    <span className="lock">◆ signed-in only</span>
                  )}
                </article>
              );
            })}
          </div>

          <p>
            <Link className="link" href="/work">
              Open the full index →
            </Link>
          </p>
        </section>
      )}

      {/* Nomvnt band motif — the page flips to forest green for the lane index. */}
      <section className="band band--dark">
        <div className="head">
          <p className="u-mono">02 — Lanes</p>
          <h2 className="head__title">Three lanes, one practice</h2>
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
          <Link className="elsewhere__row" href="/work">
            <span className="elsewhere__name">UNTAMED</span>
            <span className="elsewhere__what">
              Events and everything unsorted — the archive you&rsquo;re standing in.
            </span>
            <span className="elsewhere__go">this site →</span>
          </Link>
        </div>
      </section>

      <PhotoFold photo={featured[1]} index={1} fallbackLabel={FALLBACK_LABELS[1]} />
    </div>
  );
}

import Link from "next/link";

import { PhotoFold } from "@/components/photo-fold";
import { Plate } from "@/components/plate";
import { getAlbums, getCovers, getFeatured } from "@/lib/gallery";
import { plate } from "@/lib/format";
import { elsewhere, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const FALLBACK_LABELS = ["the opening frame", "between assignments"];

/* Composition studied from the reference layout (design.md § 3.6):
 * an opening zone that is mostly empty, a full-bleed photograph whose edges
 * land on lattice rows, then a lower zone of huge light display type against
 * a narrow justified column, with the marks placed in the margins.
 * White carries ~85% of the page; green is the photograph and one tag. */
export default async function HomePage() {
  const [featured, albums] = await Promise.all([getFeatured(2), getAlbums()]);
  const shown = albums.slice(0, 3);
  const covers = await getCovers(shown.map((a) => a.id));
  const year = new Date().getUTCFullYear();

  return (
    <div className="page">
      {/* ---- opening zone · mostly empty, marks placed in the blank cells --- */}
      <section className="open">
        <div className="open__label">
          <p className="u-mono">
            visual
            <br />
            archive
          </p>
          <p className="open__no">{`2K${String(year).slice(2)}`}</p>
          <p className="label-wide">frames not feeds</p>
        </div>

        <span className="mark mark--thin open__arrow" aria-hidden="true">
          ←
        </span>

        <div className="open__swatches">
          <div className="swatches" aria-hidden="true">
            <span className="swatch" style={{ background: "var(--color-ink)" }} />
            <span className="swatch" style={{ background: "var(--color-accent-deep)" }} />
            <span className="swatch" style={{ background: "var(--color-paper-dark)" }} />
            <span className="swatch" style={{ background: "var(--color-accent)" }} />
          </div>
          <p className="u-mono">.colour picture</p>
        </div>
      </section>

      {/* ---- the photograph · full bleed, edges on lattice rows ------------ */}
      <PhotoFold
        photo={featured[0]}
        index={0}
        size="tall"
        priority
        fallbackLabel={FALLBACK_LABELS[0]}
      />

      {/* ---- lower zone · display type against a narrow justified column --- */}
      <section className="story">
        <div className="story__head">
          <h1 className="story__title">
            the half-second
            <br />
            before it is
            <br />
            over .
          </h1>
          <p className="tag">14.8</p>
          <p className="label-wide">camera : whatever is in reach</p>
        </div>

        <span className="mark mark--bold story__arrow" aria-hidden="true">
          ↗
        </span>
        <span className="mark mark--thin story__foot" aria-hidden="true">
          ∟
        </span>

        <div className="story__col">
          <span className="bracket bracket--tr" aria-hidden="true">
            ⌐
          </span>
          <span className="ghost" aria-hidden="true">
            {String(year).slice(2)}
          </span>

          <div className="story__pair">
            <p className="story__no">14</p>
            <p className="story__gloss">Where my feet stand,</p>
            <p className="story__no">08</p>
            <p className="story__gloss">there i take a photo.</p>
          </div>

          <p className="story__body">
            I&rsquo;m {site.owner} — a data analyst by trade, which is a longer way
            of saying I spend my days looking for the moment a pattern gives
            itself away. A camera turned out to be the same habit pointed at the
            world: hold still, wait, take the frame when it stops pretending.
          </p>
          <p className="story__body">
            This is the archive. Sport lives at UNTMD Sports, food at VisuFavor,
            and everything unsorted stays here.
          </p>
          <p className="label-wide story__by">archive by {site.owner.split(" ")[0]}</p>
        </div>
      </section>

      <div className="rail">
        <span>
          <span className="rail__no">01 →</span> Selected galleries
        </span>
        <span>[{albums.length} filed]</span>
      </div>

      {/* ---- Portfolio Grid · three tiles, irregular spans ------------------ */}
      {shown.length > 0 && (
        <section className="grid-band plot">
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

      <div className="rail">
        <span>
          <span className="rail__no">02 →</span> Lanes
        </span>
        <span>[food · sport · everything else]</span>
      </div>

      {/* ---- lane index · white, hairlines only. No slab. ------------------- */}
      <section className="band plot">
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

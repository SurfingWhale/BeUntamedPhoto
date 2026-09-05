import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion";
import { SIZES } from "@/lib/images";
import { NotesPanel } from "@/components/notes-panel";
import { Plate } from "@/components/plate";
import { getAlbum, getPhotos } from "@/lib/gallery";
import { getNotes } from "@/lib/notes";
import { getViewer } from "@/lib/auth";
import { formatDate, plate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: "Not found" };
  return { title: album.title, description: album.subtitle ?? undefined };
}

export default async function AlbumPage({ params }: Params) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  const viewer = await getViewer();
  const locked = album.visibility === "members" && !viewer;

  const [photos, notes] = await Promise.all([
    locked ? Promise.resolve([]) : getPhotos(album.id),
    getNotes(album.id),
  ]);

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">
          {album.year ?? "—"}
          {album.place ? ` · ${album.place}` : ""}
          {album.visibility === "members" ? " · signed-in only" : ""}
        </p>
        <h1 className="page__title">{album.title}</h1>
        {album.subtitle && <p className="fold-text__body">{album.subtitle}</p>}
        <p>
          <Link className="link" href="/work">
            ← All galleries
          </Link>
        </p>
      </section>

      {locked ? (
        <section className="fold-text fold-text--tight">
          <div className="head">
            <span className="lock">◆ held back</span>
            <h2 className="head__title">This gallery opens once you&rsquo;re signed in.</h2>
            <p className="head__sub">
              Client work before it runs, and frames still under argument. Free
              to make an account — no mailing list, no follow-up.
            </p>
          </div>
          <p>
            <Link className="link" href={`/enter?next=${encodeURIComponent(`/work/${album.slug}`)}`}>
              Sign in to open it →
            </Link>
          </p>
        </section>
      ) : photos.length === 0 ? (
        <section className="page__pad page__pad-b">
          <p className="notes__empty">This gallery is still being filed.</p>
        </section>
      ) : (
        <div className="strip">
          {photos.map((photo, i) => (
            <Reveal as="figure" className="strip__item" key={photo.id} index={i % 2}>
              <p className="strip__no">{plate(i)}</p>
              <div className="strip__frame">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    srcSet={photo.srcSet ?? undefined}
                    sizes={i === 0 ? SIZES.plate : SIZES.plateHalf}
                    alt={photo.caption ?? `${album.title} — plate ${plate(i)}`}
                    width={photo.width ?? undefined}
                    height={photo.height ?? undefined}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                ) : (
                  <div style={{ aspectRatio: "3 / 2" }}>
                    <Plate no={plate(i)} label="file missing" />
                  </div>
                )}
              </div>
              <figcaption className="strip__cap">
                {/* The number is already hung in the margin — the caption
                    carries only what the number cannot say. */}
                {photo.caption && <span>{photo.caption}</span>}
                <span>
                  {[photo.place, formatDate(photo.taken_on)]
                    .filter(Boolean)
                    .join(" · ") || "unfiled"}
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      )}

      {/* An empty comment box under every gallery reads as an abandoned site,
          which costs more trust than the feature earns. A signed-out visitor
          only sees this once there is something in it; signed in, the form is
          there to be used. */}
      {(notes.length > 0 || viewer) && (
        <section className="fold-text fold-text--tight">
          <div className="head">
            <h2 className="head__title">Notes on this gallery</h2>
            <p className="head__sub">
              {viewer ? "Say what you saw." : "What other visitors said."}
            </p>
          </div>
          <NotesPanel albumId={album.id} initialNotes={notes} viewer={viewer} />
        </section>
      )}
    </div>
  );
}

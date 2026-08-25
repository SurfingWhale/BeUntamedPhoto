import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { NotesPanel } from "@/components/notes-panel";
import { Pager } from "@/components/pager";
import { Plate } from "@/components/plate";
import { Watermark } from "@/components/watermark";
import { clampPage, getAlbum, getPhotoPage, PER_PAGE } from "@/lib/gallery";
import type { Paged, PhotoWithUrl } from "@/lib/gallery";
import { getNotes } from "@/lib/notes";
import { getViewer } from "@/lib/auth";
import { formatDate, plate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: Pick<Params, "params">): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: "Not found" };
  return { title: album.title, description: album.subtitle ?? undefined };
}

const EMPTY_PAGE: Paged<PhotoWithUrl> = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  perPage: PER_PAGE,
};

export default async function AlbumPage({ params, searchParams }: Params) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const album = await getAlbum(slug);
  if (!album) notFound();

  const viewer = await getViewer();
  const locked = album.visibility === "members" && !viewer;
  const page = clampPage(query.page);

  const [plates, notes] = await Promise.all([
    locked ? Promise.resolve(EMPTY_PAGE) : getPhotoPage(album.id, page),
    getNotes(album.id),
  ]);

  const photos = plates.items;
  // Plate numbers count from the start of the album, not the start of the page.
  const offset = (plates.page - 1) * plates.perPage;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">
          {album.year ?? "—"}
          {album.place ? ` · ${album.place}` : ""}
          {album.visibility === "members" ? " · signed-in only" : ""}
        </p>
        <h2 className="page__title">{album.title}</h2>
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
          {photos.map((photo, i) => {
            const no = plate(offset + i);
            return (
              <figure className="strip__item" key={photo.id}>
                <div className="strip__frame">
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.url}
                      alt={photo.caption ?? `${album.title} — plate ${no}`}
                      width={photo.width ?? undefined}
                      height={photo.height ?? undefined}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  ) : (
                    <div style={{ aspectRatio: "3 / 2" }}>
                      <Plate no={no} label="file missing" />
                    </div>
                  )}
                  {photo.url && <Watermark />}
                </div>
                <figcaption className="strip__cap">
                  <span>
                    Plate {no}
                    {photo.caption ? ` · ${photo.caption}` : ""}
                  </span>
                  <span>
                    {[photo.place, formatDate(photo.taken_on)]
                      .filter(Boolean)
                      .join(" · ") || "unfiled"}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {!locked && plates.total > 0 && (
        <div className="page__pad page__pad-b">
          <Pager
            base={`/work/${album.slug}`}
            page={plates.page}
            pages={plates.pages}
            total={plates.total}
            perPage={plates.perPage}
          />
        </div>
      )}

      <section className="fold-text fold-text--tight">
        <div className="head">
          <h2 className="head__title">Notes on this gallery</h2>
          <p className="head__sub">
            {viewer
              ? "Say what you saw."
              : "Signed-in visitors can leave a note here."}
          </p>
        </div>
        <NotesPanel albumId={album.id} initialNotes={notes} viewer={viewer} />
      </section>
    </div>
  );
}

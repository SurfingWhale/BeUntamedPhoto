import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AlbumForm } from "@/components/album-form";
import { getAlbums } from "@/lib/gallery";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Darkroom", robots: { index: false } };

export default async function DarkroomPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/enter?next=%2Fdarkroom");
  if (!viewer.isOwner) redirect("/work");

  const albums = await getAlbums();

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">Owner only</p>
        <h1 className="page__title">Darkroom</h1>
        <p className="fold-text__body">
          File a gallery, then open it to add plates. Held-back galleries store
          their files in a private bucket and are served through short-lived
          signed links.
        </p>
      </section>

      <div className="dark-grid">
        <section className="panel">
          <h2 className="panel__title">Galleries</h2>
          {albums.length === 0 ? (
            <p className="notes__empty">Nothing filed yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {albums.map((album) => (
                <li className="note" key={album.id}>
                  <p className="note__body">
                    <Link className="link" href={`/darkroom/${album.slug}`}>
                      {album.title}
                    </Link>
                  </p>
                  <p className="note__meta">
                    <span>/work/{album.slug}</span>
                    <span>{album.year ?? "—"}</span>
                    <span>
                      {album.visibility === "members" ? "signed-in only" : "open"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">File a new gallery</h2>
          <AlbumForm />
        </section>
      </div>
    </div>
  );
}

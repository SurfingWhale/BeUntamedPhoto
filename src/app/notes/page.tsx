import type { Metadata } from "next";

import { NotesPanel } from "@/components/notes-panel";
import { getNotes } from "@/lib/notes";

/**
 * Prerendered and revalidated, not rendered per request.
 *
 * Nothing here is per-visitor — the masthead asks about the reader on its own —
 * so rendering it for every arrival bought nothing and cost a cache: a page
 * Next treats as dynamic goes out with `no-store`, which forbids the CDN and
 * the browser alike from keeping it.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Leave a note if you passed through the archive.",
};

export default async function NotesPage() {
  const notes = await getNotes(null);

  return (
    <div className="page">
      <section className="page__intro">
        <h1 className="page__title">
          Leave a <em>note</em>.
        </h1>
        <p className="fold-text__body">
          If a frame stopped you, say so. Notes are public, signed with your
          display name, and never turned into a mailing list.
        </p>
      </section>

      <section className="fold-text fold-text--tight">
        <NotesPanel initialNotes={notes} />
      </section>
    </div>
  );
}

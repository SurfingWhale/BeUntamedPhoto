import type { Metadata } from "next";

import { NotesPanel } from "@/components/notes-panel";
import { getNotes } from "@/lib/notes";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Leave a note if you passed through the archive.",
};

export default async function NotesPage() {
  const [notes, viewer] = await Promise.all([getNotes(null), getViewer()]);

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
        <NotesPanel initialNotes={notes} viewer={viewer} />
      </section>
    </div>
  );
}

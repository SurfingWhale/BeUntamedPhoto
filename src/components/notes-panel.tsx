"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { leaveNote, removeNote, type NoteState } from "@/app/notes/actions";
import { formatDate } from "@/lib/format";
import type { Note } from "@/lib/notes";

const MAX = 500;
const IDLE: NoteState = { status: "idle", message: "" };

type Viewer = { id: string; displayName: string; isOwner: boolean } | null;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <span className="btn__spin" aria-hidden="true" />}
      {pending ? "Sending" : label}
    </button>
  );
}

function DeleteNote({ id, path }: { id: string; path: string }) {
  const [, action] = useActionState(removeNote, IDLE);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="path" value={path} />
      <button className="note__del" type="submit">
        remove
      </button>
    </form>
  );
}

export function NotesPanel({
  albumId = null,
  initialNotes,
  viewer,
}: {
  albumId?: string | null;
  initialNotes: Note[];
  viewer: Viewer;
}) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the field from inside the action rather than an effect, so the reset
  // happens once per send instead of on every render that carries an "ok".
  const [state, action] = useActionState(async (prev: NoteState, formData: FormData) => {
    const next = await leaveNote(prev, formData);
    if (next.status === "ok") {
      formRef.current?.reset();
      setCount(0);
    }
    return next;
  }, IDLE);

  const over = count > MAX;

  return (
    <div className="notes">
      {viewer ? (
        <form className="auth__form" ref={formRef} action={action}>
          <input type="hidden" name="albumId" value={albumId ?? ""} />
          <input type="hidden" name="path" value={pathname} />

          <div className="field">
            <label className="field__label" htmlFor="note-body">
              Your note — as {viewer.displayName}
            </label>
            <textarea
              className="field__area"
              id="note-body"
              name="body"
              placeholder="What caught you?"
              maxLength={MAX + 40}
              aria-invalid={over || state.status === "error" ? true : undefined}
              aria-describedby="note-help"
              onChange={(e) => setCount(e.target.value.trim().length)}
            />
            <p
              className="field__help u-tabular"
              id="note-help"
              data-tone={over || state.status === "error" ? "error" : undefined}
              aria-live="polite"
            >
              {state.status === "error"
                ? state.message
                : over
                  ? `${count} / ${MAX} — over the limit.`
                  : `${count} / ${MAX}`}
            </p>
          </div>

          <div>
            <Submit label="Leave the note" />
          </div>

          {state.status === "ok" && (
            <p className="form-note" role="status">
              {state.message}
            </p>
          )}
        </form>
      ) : (
        <p className="form-note">
          <Link className="link" href="/enter">
            Sign in
          </Link>{" "}
          to leave a note. Notes are public and show your display name — nothing
          else.
        </p>
      )}

      {initialNotes.length === 0 ? (
        <p className="notes__empty">No notes yet — be the first.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {initialNotes.map((note) => (
            <li className="note" key={note.id}>
              <p className="note__body">{note.body}</p>
              <p className="note__meta">
                <span>{note.display_name}</span>
                <span>{formatDate(note.created_at)}</span>
                {viewer && (viewer.id === note.user_id || viewer.isOwner) && (
                  <DeleteNote id={note.id} path={pathname} />
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

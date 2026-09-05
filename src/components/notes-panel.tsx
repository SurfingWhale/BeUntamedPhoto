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
      {/* The label stays put, as it does in auth-forms — the spinner carries
          the state. Two submit buttons behaving differently is the thing the
          flow-vocabulary rule exists to stop. */}
      {label}
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

  /* Clearing the form belongs to the submission, not to a later effect
   * watching for its result. Wrapping the action puts it where it happens:
   * React treats this as part of the transition, so there is no extra render
   * pass and no set-state-in-effect. */
  const [state, action] = useActionState(async (prev: NoteState, formData: FormData) => {
    const result = await leaveNote(prev, formData);
    if (result.status === "ok") {
      formRef.current?.reset();
      setCount(0);
    }
    return result;
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
              /* Live only once there is something worth interrupting for — a
                 running count announced on every keystroke is noise. */
              aria-live={over || state.status === "error" ? "polite" : "off"}
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
        /* A guestbook with nothing in it and no way onward reads as an
           abandoned site, and this page is linked from every footer. Signed
           out, the prompt above already says how to take part, so repeating
           "be the first" underneath it is a second empty message competing
           with the first — the room to go and look at something is worth
           more. Signed in, the form is right there, so the line is an
           invitation rather than a shrug. */
        viewer ? (
          <p className="notes__empty">Nothing here yet — yours would be the first.</p>
        ) : (
          <p className="fold-text__body">
            No notes yet.{" "}
            <Link className="link" href="/work">
              Go and look at the galleries →
            </Link>
          </p>
        )
      ) : (
        <ul className="u-bare">
          {initialNotes.map((note) => (
            <li className="note" key={note.id}>
              <p className="note__body">{note.body}</p>
              {/* A div, not a p: DeleteNote renders a <form>, and a <form>
                  start tag closes an open <p> during parsing — which threw the
                  button out of this flex row and broke hydration. */}
              <div className="note__meta">
                <span>{note.display_name}</span>
                <span>{formatDate(note.created_at)}</span>
                {viewer && (viewer.id === note.user_id || viewer.isOwner) && (
                  <DeleteNote id={note.id} path={pathname} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

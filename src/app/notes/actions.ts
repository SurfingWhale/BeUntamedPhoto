"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/next-path";

export type NoteState = { status: "idle" | "error" | "ok"; message: string };

const MAX = 500;

/**
 * Which page to rebuild after a note lands.
 *
 * The panel sends its own `pathname` so the gallery the note was left on is
 * the page that gets refreshed — and it arrives as a form field, which is to
 * say from the browser, which is to say from anyone signed in. It went
 * straight into `revalidatePath`. That is a cache-control API taking an
 * unvalidated string: an arbitrary path could be handed in to drop entries
 * that have nothing to do with the note, repeatedly, and the page it names
 * would be regenerated from the database on the next request.
 *
 * Nothing dramatic — it costs the archive a re-render, not a row — but there
 * is no reason to accept it. `safeNext` does the same parse the auth redirects
 * use, so a value that is not a path here cannot get past it either, and what
 * survives that is matched against the shapes that actually hold a guestbook.
 *
 * There are four of them, not one, because `AlbumView` draws the panel on
 * every route it serves: /notes, a gallery, a gallery's later pages, and
 * /work/[slug]/open. The last is `force-dynamic` and cached nowhere, so
 * revalidating it would do nothing — the page that goes stale when a note
 * lands there is the cached public one, so that is what it names instead.
 */
const SLUG = "[A-Za-z0-9._~-]+";
const ALBUM = new RegExp(`^/work/(${SLUG})$`);
const ALBUM_PAGE = new RegExp(`^/work/(${SLUG})/p/[0-9]+$`);
const ALBUM_OPEN = new RegExp(`^/work/(${SLUG})/open$`);

function notePath(value: FormDataEntryValue | null): string {
  const path = safeNext(value, "/notes").split("?")[0].split("#")[0];
  if (path === "/notes") return path;
  if (ALBUM.test(path) || ALBUM_PAGE.test(path)) return path;
  const open = ALBUM_OPEN.exec(path);
  if (open) return `/work/${open[1]}`;
  return "/notes";
}

export async function leaveNote(
  _prev: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const body = String(formData.get("body") ?? "").trim();
  const albumId = String(formData.get("albumId") ?? "") || null;
  const path = notePath(formData.get("path"));

  if (body.length === 0) {
    return { status: "error", message: "The note is empty — write a line first." };
  }
  if (body.length > MAX) {
    return {
      status: "error",
      message: `That's ${body.length} characters. The limit is ${MAX} — trim it and send again.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sign in first, then the note will send." };
  }

  const { error } = await supabase
    .from("notes")
    .insert({ user_id: user.id, album_id: albumId, body });

  if (error) {
    return { status: "error", message: `The note didn't save — ${error.message}` };
  }

  revalidatePath(path);
  return { status: "ok", message: "Noted. Thanks for stopping." };
}

export async function removeNote(
  _prev: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const id = String(formData.get("id") ?? "");
  const path = notePath(formData.get("path"));

  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return { status: "error", message: `Couldn't remove that — ${error.message}` };
  }

  revalidatePath(path);
  return { status: "ok", message: "Removed." };
}

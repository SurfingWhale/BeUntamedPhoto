"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type NoteState = { status: "idle" | "error" | "ok"; message: string };

const MAX = 500;

export async function leaveNote(
  _prev: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const body = String(formData.get("body") ?? "").trim();
  const albumId = String(formData.get("albumId") ?? "") || null;
  const path = String(formData.get("path") ?? "/notes");

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
  const path = String(formData.get("path") ?? "/notes");

  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return { status: "error", message: `Couldn't remove that — ${error.message}` };
  }

  revalidatePath(path);
  return { status: "ok", message: "Removed." };
}

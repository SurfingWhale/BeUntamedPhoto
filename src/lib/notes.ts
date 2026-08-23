import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Note = {
  id: string;
  album_id: string | null;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string;
};

export async function getNotes(albumId: string | null, limit = 50): Promise<Note[]> {
  const supabase = await createClient();
  let query = supabase
    .from("notes_with_author")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  query = albumId === null ? query.is("album_id", null) : query.eq("album_id", albumId);

  const { data } = await query;
  return (data ?? []) as Note[];
}

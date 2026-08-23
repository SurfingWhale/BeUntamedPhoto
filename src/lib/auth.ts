import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string | null;
  displayName: string;
  isOwner: boolean;
} | null;

export async function getViewer(): Promise<Viewer> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Visitor",
    isOwner: profile?.role === "owner",
  };
}

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AccountState = { status: "idle" | "error" | "ok"; message: string };

export async function updateProfile(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (displayName.length < 2 || displayName.length > 40) {
    return {
      status: "error",
      message: "Display names run between 2 and 40 characters.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Your session expired — sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/", "layout");
  return { status: "ok", message: "Saved." };
}

export async function updatePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { status: "error", message: "Passwords need at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { status: "error", message: error.message };

  return { status: "ok", message: "Password changed." };
}

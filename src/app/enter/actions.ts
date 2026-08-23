"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AuthState = { status: "idle" | "error" | "ok"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  // Only same-origin paths — never an absolute URL from user input.
  return next.startsWith("/") && !next.startsWith("//") ? next : "/work";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!EMAIL.test(email)) {
    return { status: "error", message: "That email doesn't look right — check the address." };
  }
  if (password.length === 0) {
    return { status: "error", message: "Enter your password to sign in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "Invalid login credentials"
          ? "Email and password don't match. Try again, or send yourself a sign-in link."
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (!EMAIL.test(email)) {
    return { status: "error", message: "That email doesn't look right — check the address." };
  }
  if (password.length < 8) {
    return { status: "error", message: "Passwords need at least 8 characters." };
  }
  if (displayName.length < 2) {
    return { status: "error", message: "Pick a display name — it signs your notes." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { status: "error", message: error.message };

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  return {
    status: "ok",
    message: `Check ${email} — there's a confirmation link waiting. Open it and you're in.`,
  };
}

export async function sendMagicLink(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (!EMAIL.test(email)) {
    return { status: "error", message: "That email doesn't look right — check the address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { status: "error", message: error.message };

  return {
    status: "ok",
    message: `Sent. Open the link in ${email} on this device and you're signed in.`,
  };
}

export async function sendReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL.test(email)) {
    return { status: "error", message: "That email doesn't look right — check the address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=%2Faccount`,
  });

  if (error) return { status: "error", message: error.message };

  return {
    status: "ok",
    message: `If an account uses ${email}, a reset link is on its way.`,
  };
}

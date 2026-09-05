import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthForms } from "@/components/auth-forms";
import { isMode } from "@/lib/auth-mode";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to open the held-back galleries and the guestbook.",
};

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const viewer = await getViewer();
  const { next, error, mode } = await searchParams;

  if (viewer) redirect("/account");

  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/work";
  /* The mode is in the URL so it can be linked. "Make an account" sent from
   * anywhere used to land on Sign in, because the switcher was four buttons
   * holding React state — the address could carry `next` but not which form
   * the person actually needed. */
  const start = isMode(mode) ? mode : "signin";

  return (
    <div className="page">
      {error && (
        <div className="page__intro">
          <p className="form-note" data-tone="error" role="alert">
            {error === "exchange_failed"
              ? "That link has already been used or has expired. Ask for a fresh one."
              : "That link was missing its code. Ask for a fresh one."}
          </p>
        </div>
      )}
      <AuthForms next={target} mode={start} />
    </div>
  );
}

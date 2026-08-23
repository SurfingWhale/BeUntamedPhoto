import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthForms } from "@/components/auth-forms";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to open the held-back galleries and the guestbook.",
};

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const viewer = await getViewer();
  const { next, error } = await searchParams;

  if (viewer) redirect("/account");

  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/work";

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
      <AuthForms next={target} />
    </div>
  );
}

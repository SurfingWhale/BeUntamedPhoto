import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AccountForms } from "@/components/account-forms";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/enter?next=%2Faccount");

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">signed in · {viewer.email}</p>
        <h2 className="page__title">{viewer.displayName}</h2>
        <p className="fold-text__body">
          Every gallery is open to you, including the held-back ones.{" "}
          <Link className="link" href="/work">
            Go to the galleries →
          </Link>
        </p>
      </section>

      <section className="auth">
        <AccountForms displayName={viewer.displayName} />

        <form action="/auth/signout" method="post" className="auth__alt">
          <button className="link" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}

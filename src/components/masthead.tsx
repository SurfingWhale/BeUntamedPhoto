"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { nav, site } from "@/lib/site";

type Props = {
  viewer: { displayName: string; isOwner: boolean } | null;
};

/* N6 · Newspaper masthead — issue line, wordmark, link row, double rule. */
export function Masthead({ viewer }: Props) {
  const pathname = usePathname();

  return (
    <header className="mast">
      <div className="mast__inner">
        <p className="mast__line">{site.mastLine}</p>

        <Link href="/" aria-label={`${site.name} — home`}>
          <h1 className="mast__name">
            UNTAM<em>e</em>D
          </h1>
        </Link>

        <nav className="mast__nav" aria-label="Primary">
          <ul>
            {nav.map((item) => {
              const current =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    className="mast__link"
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {viewer?.isOwner && (
              <li>
                <Link
                  className="mast__link"
                  href="/darkroom"
                  aria-current={
                    pathname.startsWith("/darkroom") ? "page" : undefined
                  }
                >
                  Darkroom
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="mast__aside">
          {viewer ? (
            <Link className="tog" href="/account">
              {viewer.displayName}
            </Link>
          ) : (
            <Link className="tog" href="/enter">
              Sign in
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>

      <hr className="mast__rule" aria-hidden="true" />
    </header>
  );
}

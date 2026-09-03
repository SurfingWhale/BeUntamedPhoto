"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { nav, site } from "@/lib/site";

type Props = {
  viewer: { displayName: string; isOwner: boolean } | null;
};

/* Technical header rail — wordmark block left, indexed monospace nav centre,
 * account + theme right. Hairline rule beneath, sticky over the grid. */
export function Masthead({ viewer }: Props) {
  const pathname = usePathname();

  return (
    <header className="mast">
      <div className="mast__bar">
        <Link className="mast__id" href="/" aria-label={`${site.name} — home`}>
          <span className="mast__glyph" aria-hidden="true">
            U
          </span>
          <span>
            <span className="mast__name">
              UNTAM<em>E</em>D
            </span>
            <span className="mast__sub">/ {site.mastLine}</span>
          </span>
        </Link>

        <div className="mast__aside">
          {viewer ? (
            <Link className="tog" href="/account">
              {viewer.displayName}
            </Link>
          ) : (
            <Link className="tog" href="/enter">
              [Sign in]
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Tier two — the numbered index rail. */}
      <div className="mast__rail">
        <nav className="mast__rail-inner mast__nav" aria-label="Primary">
          <ul>
            {nav.map((item, i) => {
              const current =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    className="mast__link"
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                  >
                    <span className="mast__no">{String(i + 1).padStart(2, "0")}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            {viewer?.isOwner && (
              <li>
                <Link
                  className="mast__link"
                  href="/darkroom"
                  aria-current={pathname.startsWith("/darkroom") ? "page" : undefined}
                >
                  <span className="mast__no">—</span>
                  <span>Darkroom</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

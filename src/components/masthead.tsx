"use client";

import Link from "next/link";

import { Apex } from "@/components/apex";
import { Wordmark } from "@/components/wordmark";
import { usePathname } from "next/navigation";

import { MastheadRetract, ScrollRule } from "@/components/motion";
import { useViewer } from "@/components/use-viewer";
import { enterHref } from "@/lib/next-path";
import { ThemeToggle } from "@/components/theme-toggle";
import { nav, site } from "@/lib/site";

/* Technical header rail — wordmark block left, indexed monospace nav centre,
 * account + theme right. Hairline rule beneath, sticky over the grid. */
export function Masthead() {
  const pathname = usePathname();
  /* Asked here rather than passed in. The layout used to fetch it, which made
   * every page in the app read a cookie — and a page that reads a cookie is
   * rendered per request and sent `no-store`. */
  const viewer = useViewer();

  return (
    <header className="mast">
      <div className="mast__bar">
        <Link className="mast__id" href="/" aria-label={`${site.name} — home`}>
          {/* The apex, not a letter. See components/apex.tsx — this box held
              a `U` typeset in the display face, which was never the mark. */}
          <span className="mast__glyph">
            <Apex size="1.5rem" />
          </span>
          <span>
            {/* The drawn lettering, not the name set in the display face.
                The link's own aria-label names the archive, so the mark is
                decorative here — see components/wordmark.tsx. */}
            <span className="mast__name">
              <Wordmark />
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
            /* The path rides along: this is on every page, so a bare
               /enter sent every reader who used it to /work regardless of
               where they had been. enterHref drops it on the auth pages
               themselves, which are not destinations. */
            <Link className="tog" href={enterHref(pathname)}>
              [Sign in]
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* One row where there is room for one.
            This was a second tier in its own bordered rail, chosen
            deliberately to avoid the reference's shape — and the reference is
            the brief. It is in the bar now: beside the identity from 48rem,
            wrapping under it below that, where five links cannot share a row
            with anything. */}
        <nav className="mast__nav" aria-label="Primary">
          <ul>
            {/* First, not last. The rail scrolls on a phone and the owner's own
                entrance was the sixth item — off-screen, behind a swipe with no
                cue that there was anything to swipe to. */}
            {viewer?.isOwner && (
              <li>
                <Link
                  className="mast__link"
                  href="/darkroom"
                  aria-current={pathname.startsWith("/darkroom") ? "page" : undefined}
                >
                  {/* No number. The darkroom is not in the archive's index —
                      it had an em-dash standing in for one, which is a
                      placeholder pretending to be data. */}
                  <span>Darkroom</span>
                </Link>
              </li>
            )}
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
                    {/* The index number marks where you *are*, and appears
                        nowhere else.
                        It used to sit on all five at once, which cost 26px a
                        piece: measured, the rail was 649px of content in a
                        390px window for the owner and 541 for a visitor, so
                        40% of the nav was behind a swipe with the last item
                        never fully on screen. Five numerals decorating five
                        links is also five numerals saying nothing — one on the
                        current link says which plate of the archive you have
                        open, which is the conceit the rail was named for. */}
                    {current && (
                      <span className="mast__no">{String(i + 1).padStart(2, "0")}</span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <ScrollRule />
      <MastheadRetract />
    </header>
  );
}

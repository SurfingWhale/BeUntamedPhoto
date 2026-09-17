/**
 * Where to send somebody after they sign in.
 *
 * Every auth surface carries a `next` — the masthead's Sign in, the prompt
 * under a gallery's guestbook, the redirect out of `/darkroom` — and all three
 * used to sanitise it themselves with the same two-clause check:
 *
 *     next.startsWith("/") && !next.startsWith("//")
 *
 * That check is bypassable, and the bypass is a backslash. A browser
 * normalises a backslash to a forward slash inside a URL, so a redirect to
 * `/\evil.com` is fetched as `//evil.com` — protocol-relative, someone else's
 * origin, and the visitor has just been handed off to it a moment after typing
 * a password. The clause that exists to catch exactly that reads the string
 * before the browser rewrites it, so it never fires.
 *
 * Parsing is the fix rather than a third clause. `new URL(value, base)` applies
 * the same normalisation the browser would, so the origin it lands on is the
 * origin the redirect will actually reach: if it is not ours, the value was
 * never a path here. Only `pathname + search + hash` survives, so nothing is
 * carried across that was not asked for.
 */
const BASE = "http://next.invalid";

/** Where a visitor with no particular destination belongs. */
export const DEFAULT_NEXT = "/work";

/** Control characters, which belong in a header injection and not in a path. */
const CONTROL = /[\x00-\x1f\x7f]/;

/**
 * `value` as a same-origin path, or `fallback`.
 *
 * Accepts anything a form field or query string can hold — including an array,
 * which is what a repeated query parameter arrives as.
 */
export function safeNext(
  value: string | string[] | FormDataEntryValue | null | undefined,
  fallback: string = DEFAULT_NEXT,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  if (CONTROL.test(raw)) return fallback;
  if (!raw.startsWith("/")) return fallback;

  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    /* The origin is not enough, and this second check is here because the
     * first version of this function failed the test written for it.
     * `/..//evil.example` parses to *our* origin — the `..` is resolved away
     * against the base — with `//evil.example` left as the pathname. Handed
     * back and used as a redirect target, that is protocol-relative again:
     * exactly the hole the backslash opened, reached by a different route, and
     * the old two-clause check let this one through too.
     *
     * So the value that leaves is checked as the value that leaves. One
     * leading slash, and nothing that could read as an authority after it. */
    if (!path.startsWith("/") || path.startsWith("//")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

/** Pages that sign somebody in, and so cannot be signed in *to*. */
export function isAuthPath(path: string): boolean {
  return (
    path === "/enter" ||
    path.startsWith("/enter/") ||
    path.startsWith("/auth/") ||
    path === "/account"
  );
}

/**
 * A link to the sign-in page that comes back to where you were.
 *
 * Three prompts sent readers to a bare `/enter`, which lands them on `/work`
 * after they sign in — so somebody who wanted to leave a note on one gallery
 * signed in and arrived somewhere else, with the gallery they had been reading
 * gone unless they walked the history back. `next` is the whole fix, and every
 * one of those prompts already knew the path it was on.
 *
 * An auth page is never a destination: `/enter?next=%2Fenter` would answer,
 * but only by bouncing through `/account`, so those get the bare form.
 */
export function enterHref(from?: string | null, mode?: string): string {
  const path = from && !isAuthPath(from) ? safeNext(from, "") : "";
  const query = [
    mode ? `mode=${encodeURIComponent(mode)}` : "",
    path ? `next=${encodeURIComponent(path)}` : "",
  ].filter(Boolean);
  return query.length > 0 ? `/enter?${query.join("&")}` : "/enter";
}

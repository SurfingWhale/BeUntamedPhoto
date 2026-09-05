/**
 * Which form /enter opens in.
 *
 * Deliberately not in auth-forms.tsx. That file is "use client", and a value
 * exported from a client module cannot be *called* on the server — only
 * rendered as a component or passed as a prop. Importing the guard from there
 * into the page made /enter return a 500, which is the sign-in page for the
 * whole site.
 */
export type Mode = "signin" | "signup" | "link" | "reset";

const MODES: readonly Mode[] = ["signin", "signup", "link", "reset"];

/** Narrows a query-string value to a mode the page can open in. */
export function isMode(value: string | undefined): value is Mode {
  return !!value && (MODES as readonly string[]).includes(value);
}

import { site } from "@/lib/site";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "12 Mar 2026" — stable across locales, no hydration drift. */
export function formatDate(input: string | Date | null): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Plate numbers read as archive marks: 01, 02, … 47. */
export function plate(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * What a note is signed with.
 *
 * A personal name has no business on this site — CLAUDE.md states it as a
 * standing rule — and the guestbook is public, prerendered and cached for five
 * minutes, so an owner-authored note was the one path that published one. The
 * archive replies as the archive.
 *
 * It lives here rather than in lib/notes.ts because the guestbook panel is a
 * client component and lib/notes.ts is `server-only` — importing a value from
 * there would fail the build.
 *
 * `role` is optional on purpose: the column arrives with
 * supabase/byline-on-owner-notes.sql, and until that has run this reads
 * undefined and returns the profile name, exactly as before.
 */
export function authorName(note: { display_name: string; role?: string | null }): string {
  return note.role === "owner" ? site.byline : note.display_name;
}

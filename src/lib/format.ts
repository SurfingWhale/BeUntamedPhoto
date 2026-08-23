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

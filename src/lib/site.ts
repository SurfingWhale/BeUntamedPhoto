/** Everything the page says about itself, in one place. */

/**
 * The origin every absolute URL is built from — Open Graph images and the
 * manifest need one, and a relative og:image is simply ignored by WhatsApp.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every build, so this is correct
 * without any configuration. Set NEXT_PUBLIC_SITE_URL once a custom domain is
 * attached, otherwise cards keep pointing at the vercel.app hostname.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  name: "UNTAMED",
  wordmark: ["UNTAM", "E", "D"] as const,
  tagline: "Graduation, brand, sport, food and event photography.",
  /**
   * The public byline — every page that signs off reads from here. It is the
   * brand and not a legal name on purpose: a name is the strongest thing tying
   * this work to whoever made it, and this site is the creative practice and
   * nothing else. See the rule in CLAUDE.md before changing this line.
   */
  byline: "UNTAMED",
  /** The archive's own address. Never a personal account. */
  email: "untamed98x@gmail.com",
  mastLine: "Visual archive · frames, not feeds",
};

export const nav = [
  { href: "/", label: "Archive" },
  { href: "/work", label: "Galleries" },
  { href: "/elsewhere", label: "Elsewhere" },
  { href: "/about", label: "About" },
  { href: "/notes", label: "Guestbook" },
] as const;

/* Photography only. Surfing Whale and the GitHub account were both listed here
 * and both point at the build side of the practice — a prospective client
 * following either one lands somewhere that reframes the photographer as a
 * hobbyist. UNTMD Sports and VisuFavor are photography and stay. */
/**
 * The bodies of work this practice takes commissions for.
 *
 * One list, read by the album form, the server-side validator, the index
 * filter and the about page — the moment two of those disagree, a set becomes
 * unfilterable. `id` matches the check constraint in supabase/add-genre.sql.
 */
export const genres = [
  { id: "graduation", label: "Graduation", blurb: "Ceremonies, portraits, the family afterwards." },
  { id: "brand", label: "Brand", blurb: "Product, campaign and founder work for a brief." },
  { id: "sport", label: "Sport", blurb: "Court-side and field work, shot at speed." },
  { id: "food", label: "Food", blurb: "Plated, steaming, close enough to read the texture." },
  { id: "event", label: "Event", blurb: "The room as it actually was, not as it was posed." },
] as const;

export type Genre = (typeof genres)[number]["id"];

export const genreIds = genres.map((g) => g.id) as readonly Genre[];

export function genreLabel(id: string): string {
  return genres.find((g) => g.id === id)?.label ?? "Event";
}

export const elsewhere = [
  {
    name: "UNTMD Sports",
    href: "https://untmd-sports.vercel.app/",
    what: "More of the sport work — motion, sweat, the half-second before the point ends.",
    go: "untmd-sports.vercel.app",
  },
  {
    name: "VisuFavor",
    href: "https://visufavor.vercel.app/",
    what: "More of the food work — steam, char, the texture close enough to touch.",
    go: "visufavor.vercel.app",
  },
] as const;

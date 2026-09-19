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
  name: "BeUntamed",
  /* `wordmark: ["UNTAM", "E", "D"]` was here — three fragments for a masthead
   * that used to set the name in the display face and colour the middle
   * letter. The mark is drawn artwork now (components/wordmark.tsx) and
   * nothing has read this since, so it sat in the one file that defines the
   * brand still spelling the name the brand was renamed away from on
   * 2026-09-14. Dead data is bad enough; dead data contradicting the rule in
   * CLAUDE.md about which name the site carries is worse. */
  tagline: "Graduation, brand, sport, food and event photography.",
  /**
   * The public byline — every page that signs off reads from here. It is the
   * brand and not a legal name on purpose: a name is the strongest thing tying
   * this work to whoever made it, and this site is the creative practice and
   * nothing else. See the rule in CLAUDE.md before changing this line.
   */
  byline: "BeUntamed",
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

/**
 * The other two sites.
 *
 * `banner` is a still from that site, committed here rather than hotlinked: a
 * lane on this page should not go grey because another deployment is down, and
 * a background frame is worth a hundred kilobytes of our own. Both are
 * re-encoded to WebP from frames those repositories already publish.
 *
 * **`bannerSizes` is gone, and one shared `SIZES.lane` replaced it.**
 *
 * There used to be a per-lane declaration, six measured values each, and the
 * reason was `object-fit: contain`: a portrait still letterboxed inside a
 * landscape frame paints far narrower than the box it sits in, so the two
 * lanes needed different numbers for the same box. The frames crop now
 * (`cover`, see globals.css), so painted width *is* box width, the box is the
 * same for all three lanes, and one declaration is not a simplification — it
 * is the only correct answer. Per-lane values would now be six ways of saying
 * the same thing, five of them free to drift.
 *
 * **`w`/`h` stay the original file's dimensions.** Every candidate shares that
 * ratio, and the attributes exist to state it — they are not decoration: a
 * lazy banner with no reserved box made the lanes section grow 575px while a
 * visitor was mid-scroll. Measured. If a banner is re-encoded, re-measure it.
 *
 * **The food still is too small for the frame it now fills, and that is an
 * asset to re-export rather than a bug to fix here.** Cropping to the box
 * makes the box the whole job: 348 CSS px at 390 on a 3x phone asks for
 * 1044w, and 414 at 1440 asks for 828. `sport-1200.webp` covers the desktop
 * case and is 13% short on a 3x phone; `food-600.webp` is the largest food
 * candidate there is, so it is 57% of what a 3x phone wants. It reads fine at
 * 1x and 2x — 600 against the 696 a 2x phone needs is imperceptible on a
 * photograph — and soft on a dense phone. A 1200w re-export of both closes it
 * completely; pending-task.md carries it.
 */
export const elsewhere = [
  {
    name: "UNTMD Sports",
    href: "https://untmd-sports.vercel.app/",
    what: "More of the sport work — motion, sweat, the half-second before the point ends.",
    go: "untmd-sports.vercel.app",
    lane: "Sport",
    banner: "/lanes/sport-640.webp",
    bannerSet:
      "/lanes/sport-640.webp 640w, /lanes/sport-800.webp 800w, /lanes/sport-1200.webp 1200w",
    w: 1600,
    h: 1066,
  },
  {
    name: "VisuFavor",
    href: "https://visufavor.vercel.app/",
    what: "More of the food work — steam, char, the texture close enough to touch.",
    go: "visufavor.vercel.app",
    lane: "Food",
    banner: "/lanes/food-420.webp",
    bannerSet: "/lanes/food-420.webp 420w, /lanes/food-600.webp 600w",
    w: 600,
    h: 750,
  },
] as const;

/**
 * The home page's four photographic slots, in the order the page renders them.
 * The darkroom offers exactly these; the check constraint in
 * supabase/add-featured-rank.sql refuses anything else.
 */
export const FEATURED_SLOTS = [
  { rank: 1, label: "Hero", what: "full bleed, the statement set on it" },
  { rank: 2, label: "Index band", what: "the frame the genre filter sits on" },
  { rank: 3, label: "Lane banner", what: "the archive's own card in the lanes" },
  { rank: 4, label: "Closing fold", what: "the plate the page ends on" },
] as const;

export type FeaturedSlot = (typeof FEATURED_SLOTS)[number];

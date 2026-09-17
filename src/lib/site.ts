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
  wordmark: ["UNTAM", "E", "D"] as const,
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
 * Two candidates each, because one file cannot serve both ends: the frame's
 * box runs from 218px on a 320px phone to 416px at 1440, and a single 1600px
 * file meant a phone pulled 169KB to fill 273px. `banner` is the small
 * candidate, so a browser that ignores srcset still gets the sensible one.
 *
 * `bannerSizes` is per lane, not shared, and describes the width the *frame*
 * renders at — not the width of the box around it. These are object-fit:
 * contain, so a portrait still in a landscape box renders far narrower than
 * the box; one shared declaration over-declared it by a candidate step.
 *
 * `w`/`h` stay the original file's dimensions. Every candidate shares that
 * ratio, and the attributes exist to state it — they are not decoration: a
 * lazy banner with no reserved box made the lanes section grow 575px while a
 * visitor was mid-scroll. Measured. If a banner is re-encoded, re-measure it.
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
    /* 1.50 wide, in a box whose height tracks --row below 48rem. Measured, the
     * frame lands at 264px of a 320 viewport, 322 of 390 and 355 of 430 —
     * 82.6% of the viewport each time, so a vw fits the range a fixed px
     * cannot. A flat 355px over-declared the two narrow ends by a whole
     * candidate step and pulled the 1200w file onto a 320px phone.
     *
     * 800w exists because 390 @2x needs 644px, and the gap from 640 to 1200
     * meant a 4px shortfall cost 70KB.
     *
     * 2026-09-14: **this declaration was right and the layout had drifted
     * away from it.** Re-measured before stacking the lanes on a phone, the
     * painted width in the reel was 216 / 271 / 302 at those three widths —
     * not the 264 / 322 / 355 above. The figures in this comment are the
     * *stacked* ones, taken before the lanes became a reel, and nobody
     * re-measured when they did: 83vw has been over-declaring by ~19% ever
     * since, which at 390 @2x meant the 800w file where 640w would do.
     *
     * Stacking them below 48rem makes the numbers above true again, and they
     * were re-measured to confirm it rather than assumed — 264 / 322 / 355
     * exactly. This is the failure CLAUDE.md warns about under SIZES ("wrong
     * precisely because a column count changed and the declaration did not"),
     * and it is the one instance that warning did not already cover. */
    /* 35vw below 48rem since the lanes became rows on a phone: the frame is the
     * leading 2fr of the row and paints at 32.7-34.6vw across 320-430,
     * measured. The 83vw this replaced was the stacked card, and it pulled the
     * 1200w file for a 133px frame at 390. */
    bannerSizes: "(min-width: 64rem) 396px, (min-width: 48rem) 316px, 35vw",
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
    // 0.80 tall in the same box, so it renders 141/172/190/169/211 — far
    // narrower than the box it sits in. Declaring the box made a phone take
    // the 600w file to fill 172px.
    /* 28vw below 48rem: a portrait plate in the row's frame is height-bound
     * and paints at a constant 28.0vw from 320 to 430, measured. The flat
     * 190px it replaces took the 600w file for a 109px frame. */
    bannerSizes: "(min-width: 64rem) 211px, (min-width: 48rem) 169px, 28vw",
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

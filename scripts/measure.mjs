#!/usr/bin/env node
/**
 * `npm run measure` — the checks in design.md § 12, as something that runs.
 *
 * Every regression found on this site in the last month had the same shape: a
 * change somewhere invalidated an assumption somewhere else, silently, and
 * nothing caught it. The build was green every time. Four of the five were
 * only visible to something that measured rendered boxes, and one — three
 * typefaces that never applied for months — was visible only to something
 * that asked the page what it was actually drawing in.
 *
 * A design system that is not asserted anywhere is a document, not a system.
 *
 * Two halves:
 *
 *   Static gates    files only. No browser, no server, always run.
 *   Browser checks  need the site running. Skipped, loudly, if it is not.
 *
 * Usage:
 *   npm run measure                      static gates, plus browser checks
 *                                        against http://localhost:3000
 *   npm run measure -- --base <url>      point the browser checks elsewhere
 *   npm run measure -- --base <url> --bypass <secret>
 *                                        ...including a deployment behind
 *                                        Vercel Deployment Protection
 *   npm run measure -- --static          static gates only
 *
 * Exits non-zero if any gate fails, so it can be the thing CI runs.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = opt("base", "http://localhost:3000").replace(/\/$/, "");

/**
 * Vercel Deployment Protection bypass, for measuring a deployment that is not
 * public.
 *
 * This project has Vercel Authentication switched on for every deployment URL
 * (`all_except_custom_domains`, and there is no custom domain), so an
 * anonymous request to the deployed site gets a login wall rather than the
 * page. That is a deliberate setting and not this script's business to change.
 *
 * Vercel's own answer for automation is a bypass secret: send it as
 * `x-vercel-protection-bypass` and the request is served. Generate one in
 * Project Settings > Deployment Protection, give it to CI as a secret, and the
 * gates can measure the real deployed page — real data, real credentials, the
 * page a visitor actually gets — without making anything public.
 *
 * Absent, the browser half simply reports that the URL did not answer. It
 * never silently measures a login wall and calls it a pass.
 */
const BYPASS = opt("bypass", process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? "");
const BYPASS_HEADERS = BYPASS ? { "x-vercel-protection-bypass": BYPASS } : {};
const CSS = "src/app/globals.css";
const TOKENS = "tokens.css";

/* Phone first, because every one of those regressions was worse there. */
const VIEWPORTS = [
  { w: 390, h: 844, dpr: 3, name: "phone" },
  { w: 1440, h: 900, dpr: 2, name: "desktop" },
];
const PAGES = ["/", "/work", "/about", "/elsewhere", "/notes"];

/**
 * How many typefaces the site is supposed to draw in. This is the single
 * highest-value line in the file.
 *
 * Three families were specified and **none of them ever applied, for months**,
 * because next/font puts its variable on whatever element carries the
 * generated class and tokens.css built --font-display on :root — with the
 * class on <body> the variable was undefined where it was read, the token
 * computed to the guaranteed-invalid value, and every descendant inherited
 * that. The build was green, the CSS was valid, three woff2 files were
 * preloaded and used by nothing. Only asking the page what it was actually
 * drawing in would have caught it, and nothing asked.
 *
 * It is 2: Syne 800 for the display role, the system stack for body and
 * metadata. Both are deliberate — design.md § 5 wants body on a neutral
 * grotesque and the system stack is one — and the difference between a
 * deliberate choice and an accident is exactly what this number records. If
 * it ever reads 1 again, the font class has come off <html> and the whole
 * display role has silently fallen back.
 */
const EXPECTED_FAMILIES = 2;

let failures = 0;
let skipped = 0;

const read = (p) => readFileSync(p, "utf8");
const ok = (msg) => console.log(`  \x1b[32mpass\x1b[0m  ${msg}`);
const bad = (msg, detail) => {
  failures++;
  console.log(`  \x1b[31mFAIL\x1b[0m  ${msg}`);
  for (const line of [].concat(detail ?? [])) console.log(`        ${line}`);
};
const note = (msg) => console.log(`        ${msg}`);
const skip = (msg) => {
  skipped++;
  console.log(`  \x1b[33mskip\x1b[0m  ${msg}`);
};
const section = (name) => console.log(`\n\x1b[1m${name}\x1b[0m`);

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

/* Rule blocks, joined. These declarations span several lines, so any check
 * that reads the stylesheet a line at a time answers the wrong question. */
const ruleBlocks = (css) =>
  css
    /* Comments out first, or every reported selector arrives with the
     * paragraph above it attached and the output is unreadable. */
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\n/g, " ")
    .split("}")
    .map((b) => {
      const i = b.indexOf("{");
      if (i < 0) return null;
      const selector = b.slice(0, i).replace(/\s+/g, " ").trim();
      return {
        selector,
        /* Each selector on its own, because a block groups many and a fault
         * is usually in one of them. A whole-block test exempted the caps
         * block from gate 2 as soon as one wordmark was in the list. */
        selectors: selector.split(",").map((x) => x.trim()).filter(Boolean),
        body: b.slice(i + 1),
      };
    })
    .filter(Boolean);

/* ---------------------------------------------------------- static gates */

section("Static gates");

/* 1. Capitals follow the case rule. design.md § 5: the wordmark, the ticker,
 *    tiny labels and control text may be capitals. A heading or a card title
 *    may not. .foot__statement outlived the de-shouting pass by weeks. */
{
  const HEADINGS = /^(h[1-3]|\.[a-z-]*__title|\.[a-z-]*__statement|\.reel__name|\.elsewhere__name|\.chip)\b/;
  const hits = ruleBlocks(read(CSS))
    .filter((r) => /text-transform:\s*uppercase/.test(r.body))
    .flatMap((r) => r.selectors.filter((sel) => HEADINGS.test(sel)));
  if (hits.length) bad("a heading or card title is set in capitals", hits);
  else ok("no heading or card title in capitals");
}

/* 2. Tracking follows the case, not the size. Capitals want the positive
 *    step; lowercase display type wants a negative one. Six headings sat on
 *    --tracking-caps for weeks after they stopped being capitals. */
{
  const WORDMARK = /wordmark|mast__name/;
  const hits = ruleBlocks(read(CSS))
    .filter((r) => /letter-spacing:\s*var\(--tracking-caps\)/.test(r.body))
    .flatMap((r) => r.selectors.filter((sel) => !WORDMARK.test(sel)));
  if (hits.length)
    bad("--tracking-caps on something that is not a wordmark", [
      ...hits,
      "capitals track out; lowercase display type tracks in (design.md § 5)",
    ]);
  else ok("--tracking-caps only on the wordmarks");
}

/* 3. No literal colour in anything that paints. Narrowed to the painting
 *    properties on purpose: px literals are legitimate — hairlines, hit
 *    targets, mask stops, breakpoints — and a check that flags them flags
 *    over a hundred lines and gates nothing. */
{
  const PAINT = /(^|[\s{])(color|background|background-color|border(-[a-z]+)?-color|fill|stroke|outline-color)\s*:/;
  const SAFE = /var\(--|currentColor|transparent|inherit|none|initial|unset/;
  const hits = [];
  for (const decl of read(CSS).replace(/\n/g, " ").split(";")) {
    if (PAINT.test(decl) && !SAFE.test(decl)) hits.push(decl.trim().slice(0, 110));
  }
  if (hits.length) bad("a literal colour outside tokens.css", hits);
  else ok("every painted colour comes from a token");
}

/* 4. Comment markers balance. Cheap, and it earns its place: a comment closed
 *    one line early inside tokens.css turned the whole rest of :root into
 *    stray text — every colour, size and easing after that point silently
 *    gone. CSS does not error, the build was green, lint was green, and the
 *    only tell was a contrast measurement coming back as if a scrim were not
 *    there. A mismatch here means a stylesheet is truncated. */
{
  let bust = false;
  for (const f of [TOKENS, CSS]) {
    const t = read(f);
    const open = (t.match(/\/\*/g) ?? []).length;
    const close = (t.match(/\*\//g) ?? []).length;
    if (open !== close) {
      bad(`${f} has unbalanced comment markers`, [`${open} opened, ${close} closed — the file is truncated from the mismatch onward`]);
      bust = true;
    }
  }
  if (!bust) ok("comment markers balance in both stylesheets");
}

/* 5. --color-accent-ink means text *on* lime. Used on a canvas it is
 *    near-black in light and the page's own background in dark, so the glyph
 *    is painted in the background colour and vanishes. .rail__mark did
 *    exactly that, and only a dark-mode screenshot caught it: the value came
 *    from a token, it was simply the wrong one.
 *
 *    A rule passes if it pairs the token with lime in either direction — lime
 *    ground and ink text, or ink ground and lime text, which is the inversion
 *    the ticker's own control uses. Anything else has to be listed here with
 *    a reason, so a new use is a decision rather than an accident. */
{
  const INHERITS_LIME = [
    // The lime ground is on the ancestor, .elsewhere__row:hover, which sets
    // background: var(--color-accent) before these children recolour.
    ".elsewhere__row:hover .elsewhere__name",
    // Sits inside .ticker, which *is* the lime band, so this control is
    // transparent on purpose and takes ink for its border and its label.
    ".ticker__toggle",
  ];
  const pairsWithLime = (body) =>
    /background(-color)?:\s*var\(--color-accent\)/.test(body) ||
    (/background(-color)?:\s*var\(--color-accent-ink\)/.test(body) &&
      /color:\s*var\(--color-accent\)/.test(body));

  const hits = ruleBlocks(read(CSS))
    .filter(
      (r) =>
        /var\(--color-accent-ink\)/.test(r.body) &&
        !pairsWithLime(r.body) &&
        !INHERITS_LIME.some((sel) => r.selector.includes(sel)),
    )
    .map((r) => r.selector || "(unnamed)");
  if (hits.length)
    bad("--color-accent-ink used without a lime ground", [
      ...hits,
      "that token is text on lime; on a canvas use --color-accent-deep,",
      "or add the selector to INHERITS_LIME in this script with the reason",
    ]);
  else ok("--color-accent-ink only ever sits on lime");
}

/* 6. No orphaned tokens. Four went dead the day the drawn lattice was
 *    removed, and a dead token is an invitation to use it for the wrong thing
 *    later. Declarations inside tokens.css count as consumers, because --row
 *    is built from --module.
 *
 *    A *scale* is allowed unused steps: deleting --z-modal because no modal
 *    exists yet would mean the next one picks an arbitrary number, and the
 *    point of a scale is that it is complete. A one-off with no consumer is
 *    not a scale, and gets deleted. Everything kept is listed with which
 *    scale it belongs to, so going dead is still a decision. */
{
  const KEPT_UNUSED = {
    "--text-3xl": "type scale step, between --text-2xl and --text-display-s",
    "--ease-in": "easing set, alongside --ease-out and --ease-emphasised",
    "--ease-in-out": "easing set",
    "--z-dropdown": "z scale step",
    "--z-modal": "z scale step",
    "--z-tooltip": "z scale step",
  };
  const declared = new Set(
    [...read(TOKENS).matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
  );
  const haystack =
    walk("src").filter((f) => /\.(tsx?|css|jsx?)$/.test(f)).map(read).join("\n") +
    read(TOKENS);
  const orphans = [...declared].filter(
    (t) => !haystack.includes(`var(${t})`) && !(t in KEPT_UNUSED),
  );
  const stale = Object.keys(KEPT_UNUSED).filter((t) => !declared.has(t));
  if (orphans.length)
    bad("token declared but never read", [
      ...orphans,
      "delete it, or add it to KEPT_UNUSED in this script with the scale it belongs to",
    ]);
  else if (stale.length)
    bad("KEPT_UNUSED names a token that no longer exists", stale);
  else
    ok(
      `all ${declared.size} tokens accounted for (${Object.keys(KEPT_UNUSED).length} held as scale steps)`,
    );
}

/* 7. No dead class. A rule nobody can reach is worse than clutter: it keeps
 *    the tokens it reads looking alive, so the orphan gate above passes while
 *    a whole chain is unreachable. .plot had seven rules, no markup since the
 *    lanes became a reel, and it was the only reader of --color-crosshair and
 *    --color-crosshair-on-dark — which the orphan gate therefore counted as
 *    accounted for. And design.md gained a sentence claiming .band--dark "is
 *    the only place a section paints over the page" when nothing had used it
 *    for weeks, written from reading the CSS instead of checking for callers.
 *
 *    Class names are read out of the stylesheet with strings and url() values
 *    stripped first: the crosshair cursor is a data-URI SVG containing
 *    "www.w3.org", and a naive scan reports .w3 and .org as dead classes.
 *
 *    A class built at runtime (`fold-photo--${size}`) never appears literally,
 *    so its fragments go in KEPT_UNREFERENCED with the template that builds
 *    them — as does a primitive design.md documents but no page uses yet. */
{
  const KEPT_UNREFERENCED = {
    "band--dark": "slab primitive design.md § 11 documents; no page uses it since 8418e1b",
    "fold-photo--band": "built at runtime by photo-fold.tsx as `fold-photo--band`",
  };
  const css = read(CSS)
    /* Comments, quoted strings and url() payloads out first — a data-URI SVG
     * is full of things that look like class selectors. */
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/url\((?:[^()]|\([^()]*\))*\)/g, " ")
    .replace(/"[^"]*"|'[^']*'/g, " ");
  const declared = new Set(
    [...css.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((m) => m[1]),
  );
  const markup = walk("src").filter((f) => /\.tsx?$/.test(f)).map(read).join("\n");
  const dead = [...declared].filter(
    (c) => !(c in KEPT_UNREFERENCED) && !new RegExp(`\\b${c.replace(/-/g, "\\-")}\\b`).test(markup),
  );
  const stale = Object.keys(KEPT_UNREFERENCED).filter((c) => !declared.has(c));
  if (dead.length)
    bad("class styled but never used in any markup", [
      ...dead.sort(),
      "delete the rules, or add the class to KEPT_UNREFERENCED with why it stays",
    ]);
  else if (stale.length)
    bad("KEPT_UNREFERENCED names a class that no longer exists", stale);
  else
    ok(
      `all ${declared.size} classes reachable (${Object.keys(KEPT_UNREFERENCED).length} held deliberately)`,
    );
}

/* 8. Every sign-off reads from the byline, and the byline is the brand.
 *    CLAUDE.md is the authority on why this matters. */
{
  const site = read("src/lib/site.ts");
  const m = site.match(/byline:\s*"([^"]+)"/);
  if (!m) bad("src/lib/site.ts declares no byline");
  else if (m[1] !== "UNTAMED") bad(`byline is "${m[1]}", expected the brand`);
  else {
    const uses = walk("src").filter((f) => /\.tsx?$/.test(f)).filter((f) => read(f).includes("site.byline"));
    ok(`byline is "${m[1]}", read by ${uses.length} files`);
  }
}

/* ------------------------------------------------------- browser checks */

if (flag("static")) {
  section("Browser checks");
  skip("--static given");
} else {
  section("Browser checks");
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    skip("playwright-core is not installed — `npm i -D playwright-core`");
  }

  const findBrowser = () => {
    /* Checked for existence, not trusted: a CHROME_PATH pointing at nothing
     * would otherwise reach chromium.launch() and throw, and a measurement
     * harness that crashes the build when a browser is missing is worse than
     * one that says so and skips. */
    if (process.env.CHROME_PATH) {
      return existsSync(process.env.CHROME_PATH) ? process.env.CHROME_PATH : undefined;
    }
    const guesses = [
      "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/google-chrome",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    return guesses.find((p) => existsSync(p));
  };

  /**
   * Is the URL serving *this site*? Not "did it answer" — that is not the same
   * question, and the difference already cost a CI run.
   *
   * The first version of this checked for 401 or 403, reasoning that a
   * protected deployment refuses the request. Vercel does not refuse it: it
   * answers **200 with an HTML login page**. So the gates measured the wall and
   * reported ten failures — "draws in 1 typefaces, expected 2 — GeistSans",
   * sticky `.fixed` and `.w-full` elements, a `.text-heading-32` heading. All
   * of that is Vercel's own page, in Vercel's font, using Tailwind utilities
   * this project does not have. The run went red, which is better than a false
   * pass, but it went red for a reason that had nothing to do with the site.
   *
   * So the precondition is identity, not reachability: the page has to contain
   * this site's own wordmark, read out of src/lib/site.ts so it cannot drift
   * from the thing being measured. That one assertion catches the login wall,
   * a stale --base, a 404, a maintenance page and a parked domain — anything
   * that is not the site — without knowing a single thing about how Vercel
   * signals protection.
   */
  const servesThisSite = async () => {
    const byline = read("src/lib/site.ts").match(/byline:\s*"([^"]+)"/)?.[1];
    if (!byline) {
      bad("could not read the byline from src/lib/site.ts to identify the site");
      return false;
    }
    let res;
    try {
      res = await fetch(BASE, {
        headers: BYPASS_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
    } catch (err) {
      skip(`${BASE} did not answer — ${String(err).split("\n")[0]}`);
      return false;
    }
    if (res.status === 401 || res.status === 403) {
      skip(
        `${BASE} answered ${res.status} — deployment protection. Pass --bypass <secret>, or set VERCEL_AUTOMATION_BYPASS_SECRET`,
      );
      return false;
    }
    const html = await res.text().catch(() => "");
    if (html.includes(byline)) return true;

    /* Name what it actually served, so the next reader is not guessing. */
    const title = html.match(/<title[^>]*>([^<]{0,80})/i)?.[1]?.trim();
    const vercelWall =
      /vercel/i.test(title ?? "") ||
      /GeistSans|_vercel\/insights|vercel\.com\/sso/i.test(html);
    skip(
      vercelWall
        ? `${BASE} served Vercel's authentication page (HTTP ${res.status}), not the archive — ` +
            "deployment protection. Pass --bypass <secret>, or set " +
            "VERCEL_AUTOMATION_BYPASS_SECRET"
        : `${BASE} answered ${res.status} but the page does not contain "${byline}"` +
            `${title ? ` — it served "${title}"` : ""}. Wrong --base?`,
    );
    return false;
  };

  if (chromium) {
    const exe = findBrowser();
    if (!exe) {
      skip("no Chromium found — set CHROME_PATH, or `npx playwright install chromium`");
    } else if (!(await servesThisSite())) {
      /* servesThisSite() has already said what it found and what to do. */
    } else {
      try {
        await browserChecks(chromium, exe);
      } catch (err) {
        /* A gate that fails is a finding; a harness that throws is not. Report
         * it as a failure with the reason rather than as a stack trace. */
        bad("the browser checks could not run", [String(err).split("\n")[0]]);
      }
    }
  }
}

async function browserChecks(chromium, executablePath) {
  const browser = await chromium.launch({ executablePath });

  for (const vp of VIEWPORTS) {
    console.log(`\n  \x1b[1m${vp.name} — ${vp.w}x${vp.h} dpr${vp.dpr}\x1b[0m`);
    const page = await browser.newPage({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: vp.dpr,
      /* Every request, not just the first: the bypass has to be on the
       * document, the CSS, the JS and every image, or a protected deployment
       * renders as a page of 401s and the measurements are of nothing. */
      extraHTTPHeaders: BYPASS_HEADERS,
    });

    for (const path of PAGES) {
      const res = await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => null);
      if (!res || !res.ok()) {
        bad(`${path} did not load`, [res ? `status ${res.status()}` : "no response"]);
        continue;
      }

      /* Height drift across a full scroll. The lanes grew a section 575px
       * under the reader because width/height attributes lose to a CSS
       * `width: auto`. This must be 0. */
      const drift = await page.evaluate(async () => {
        const h0 = document.documentElement.scrollHeight;
        const step = window.innerHeight;
        for (let y = 0; y < h0 + step; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
        return { h0, h1: document.documentElement.scrollHeight };
      });
      if (drift.h1 !== drift.h0)
        bad(`${path} drifted ${drift.h1 - drift.h0}px across a full scroll`, [
          "an image box is not reserved — width/height attributes lose to any author width/height CSS",
        ]);

      const m = await page.evaluate(
        ({ vw, vh }) => {
          /* How many typefaces the page actually draws in. Three families
           * were specified and never applied for months because a var()
           * resolves where it is declared, not where it is used. */
          const name = (el) => {
            const c = el.className?.toString().trim().split(/\s+/)[0];
            return c ? `.${c}` : el.tagName.toLowerCase();
          };
          const families = new Set();
          const display = [];
          const stickies = [];
          const slots = [];

          for (const el of document.querySelectorAll("*")) {
            const cs = getComputedStyle(el);
            const hasText = [...el.childNodes].some(
              (n) => n.nodeType === 3 && n.textContent.trim(),
            );
            if (hasText) families.add(cs.fontFamily.split(",")[0].replace(/["']/g, "").trim());

            if (cs.position === "sticky" || cs.position === "fixed") {
              const top = cs.top;
              if (top !== "auto")
                stickies.push({
                  sel: name(el),
                  top,
                  usesInset: /safe-area-inset/.test(
                    el.style.top || "",
                  ) || /max\(/.test(top),
                });
            }

            if (hasText && parseFloat(cs.fontSize) >= 32)
              display.push({
                sel: name(el),
                px: parseFloat(cs.fontSize),
                shareOfVw: +((parseFloat(cs.fontSize) / vw) * 100).toFixed(2),
              });
          }

          /* Every sizes slot: the box it renders at, against the candidate the
           * browser actually picked. Four declarations were wrong — one said
           * 100vw for a 167px box and pulled 1500w into it. */
          for (const img of document.querySelectorAll("img[sizes]")) {
            const r = img.getBoundingClientRect();
            if (!r.width) continue;
            slots.push({
              sizes: img.getAttribute("sizes"),
              box: Math.round(r.width),
              picked: img.currentSrc
                ? +(img.currentSrc.match(/[?&]w(?:idth)?=(\d+)/)?.[1] ?? 0)
                : 0,
              dpr: window.devicePixelRatio,
            });
          }

          return {
            families: [...families],
            scrollH: document.documentElement.scrollHeight,
            screens: +(document.documentElement.scrollHeight / vh).toFixed(2),
            overflowX:
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
            display: display.sort((a, b) => b.px - a.px).slice(0, 3),
            stickies,
            slots,
          };
        },
        { vw: vp.w, vh: vp.h },
      );

      const flags = [];
      if (m.overflowX > 0) flags.push(`scrolls ${m.overflowX}px sideways`);
      if (m.families.length !== EXPECTED_FAMILIES)
        flags.push(
          `draws in ${m.families.length} typefaces, expected ${EXPECTED_FAMILIES} — ${m.families.join(", ")}`,
        );
      for (const s of m.stickies)
        if (!s.usesInset)
          flags.push(`${s.sel} is sticky at top:${s.top} with no safe-area inset`);
      for (const s of m.slots) {
        const need = s.box * s.dpr;
        if (s.picked && s.picked > need * 1.6)
          flags.push(`sizes "${s.sizes}" pulled ${s.picked}w for a ${s.box}px box`);
      }

      if (flags.length) bad(`${path} · ${m.screens} screens`, flags);
      else
        ok(
          `${path} · ${m.screens} screens · ${m.scrollH}px · ${m.families.length} famil${m.families.length === 1 ? "y" : "ies"} · drift 0 · no overflow`,
        );

      if (path === "/") {
        note(`families: ${m.families.join(", ")} (expected ${EXPECTED_FAMILIES})`);
        note(
          `largest type: ${m.display.map((d) => `${d.sel} ${d.px}px (${d.shareOfVw}% vw)`).join(" · ")}`,
        );
      }
    }
    await page.close();
  }
  await browser.close();
}

/* ------------------------------------------------------------- verdict */

console.log("");
if (failures) {
  console.log(`\x1b[31m${failures} gate${failures === 1 ? "" : "s"} failed.\x1b[0m`);
  process.exit(1);
}
console.log(
  `\x1b[32mAll gates passed.\x1b[0m${skipped ? ` ${skipped} skipped.` : ""}`,
);

# Vendored fonts

Both faces are used by `src/app/opengraph-image.tsx`, which renders the share
card through Satori. Satori needs TrueType or WOFF — it cannot read the WOFF2
that `next/font/google` downloads — so the TTFs are committed here rather than
fetched at build time. Vendoring also keeps the build off the network.

| File | Family | Used for | Licence |
| --- | --- | --- | --- |
| `Syne-ExtraBold.ttf` | Syne 800 | the wordmark | SIL Open Font License 1.1 |
| `JetBrainsMono-Regular.ttf` | JetBrains Mono 400 | labels and metadata | SIL Open Font License 1.1 |

Both are the same families the site loads at runtime via `next/font/google`
(see `src/app/layout.tsx`), so the card matches the page.

Source: fonts.gstatic.com, via the Google Fonts CSS API.

# Vendored fonts

Both faces are used by `src/app/opengraph-image.tsx`, which renders the share
card through Satori. Satori needs TrueType or WOFF — it cannot read WOFF2 — so
the TTFs are committed here rather than fetched at build time. Vendoring also
keeps the build off the network.

| File | Family | Used for | Licence |
| --- | --- | --- | --- |
| `Syne-ExtraBold.ttf` | Syne 800 | the wordmark, on the share card | SIL Open Font License 1.1 |
| `JetBrainsMono-Regular.ttf` | JetBrains Mono 400 | labels on the share card | SIL Open Font License 1.1 |

`Syne-ExtraBold.ttf` is also **the source of the site's display face**:
`src/app/fonts/syne-800-latin.woff2` is this file subset to Google's `latin`
range and converted, 52,868 bytes down to 10,736. `src/app/layout.tsx` loads
that through `next/font/local`. Regenerate it from here if the range ever
needs widening:

```bash
pip install fonttools brotli
python3 -m fontTools.subset assets/Syne-ExtraBold.ttf \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2190,U+2191-2193,U+2197,U+2212,U+2215,U+FEFF,U+FFFD" \
  --layout-features=kern,liga,calt \
  --flavor=woff2 \
  --output-file=src/app/fonts/syne-800-latin.woff2
```

The range is Google's own `latin` subset plus the three arrows the site sets in
display type. It is deliberately not a hand-picked glyph list: `.reel__name`
and `.album__title` are gallery titles typed by the owner, so the face has to
cover ordinary Latin or a heading falls back mid-word.

**The card and the page agree on the display face and differ on the label
face, and that is the same rule under a different constraint.** design.md § 5
puts body and metadata on the system stack — a neutral grotesque the device
already has. A server-side image renderer has no system stack, so the card
substitutes a vendored face for that one role. The display face is the same in
both, which is the half that carries the brand.

# Vendored fonts

Both faces are used by `src/app/opengraph-image.tsx`, which renders the share
card through Satori. Satori needs TrueType or WOFF — it cannot read WOFF2 — so
the TTFs are committed here rather than fetched at build time. Vendoring also
keeps the build off the network.

| File | Family | Used for | Licence |
| --- | --- | --- | --- |
| `Archivo-wdth-wght-latin.woff2` | Archivo variable | the source both derived files come from | SIL Open Font License 1.1 (`Archivo-OFL.txt`) |
| `Archivo-ExpandedExtraBold.ttf` | Archivo 800 / wdth 125 | the wordmark on both share cards | as above |
| `JetBrainsMono-Regular.ttf` | JetBrains Mono 400 | labels on both share cards | SIL Open Font License 1.1 |

Syne was here until 2026-09-11 and is gone; the owner replaced it on sight.

**The display face is derived, not committed twice.** One source, two outputs,
both regenerable:

```bash
pip install fonttools brotli
python3 - <<'EOF'
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import subprocess

SRC = "assets/Archivo-wdth-wght-latin.woff2"
LATIN = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
         "U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2190,"
         "U+2191-2193,U+2197,U+2212,U+2215,U+FEFF,U+FFFD")
PIN = {"wght": 800, "wdth": 125}

# what the site loads — pinned, then subset
f = TTFont(SRC); instantiateVariableFont(f, PIN, inplace=True, updateFontNames=True)
f.flavor = "woff2"; f.save("/tmp/pinned.woff2")
subprocess.run(["python3","-m","fontTools.subset","/tmp/pinned.woff2",
  f"--unicodes={LATIN}", "--layout-features=kern,liga,calt", "--flavor=woff2",
  "--output-file=src/app/fonts/archivo-800exp-latin.woff2"], check=True)

# what Satori loads — same instance, as TTF, unsubset
g = TTFont(SRC); instantiateVariableFont(g, PIN, inplace=True, updateFontNames=True)
g.flavor = None; g.save("assets/Archivo-ExpandedExtraBold.ttf")
EOF
```

**Pinning is the whole trick.** Left with both axes free the subset is 72.5KB;
pinned to the one weight and width the display role ever sets, it is 10.7KB —
within 200 bytes of the Syne it replaced. The share card keeps a TTF because
Satori cannot read WOFF2, and it is unsubset because Satori needs whatever
glyphs a gallery title happens to contain.

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

#!/usr/bin/env python3
"""Generate the PWA icon set.

The mark is the masthead glyph (.mast__glyph): a forest slab, a lime hairline
inset from the edge, and a blocky grotesque U. It is drawn from rectangles
rather than set in a typeface, which keeps it rectilinear like the rest of the
system and keeps this script dependency-free — there is no PIL here.

Run from the repo root:  python3 scripts/make-icons.py
"""

import struct
import zlib
from pathlib import Path

SLAB = (0x05, 0x1C, 0x14)   # --color-paper-dark
LIME = (0xC4, 0xF2, 0x3E)   # --color-accent


def png(width: int, height: int, pixels: list[list[tuple[int, int, int]]]) -> bytes:
    """Minimal 8-bit RGB PNG. Filter 0 on every scanline."""
    raw = b"".join(
        b"\x00" + b"".join(bytes(px) for px in row) for row in pixels
    )

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def mark(size: int, safe: float = 1.0) -> bytes:
    """`safe` shrinks the artwork for maskable icons, whose outer ~20% can be
    cropped to whatever shape the launcher wants."""
    px = [[SLAB for _ in range(size)] for _ in range(size)]

    def rect(x0: float, y0: float, x1: float, y1: float, colour):
        for y in range(max(0, round(y0)), min(size, round(y1))):
            row = px[y]
            for x in range(max(0, round(x0)), min(size, round(x1))):
                row[x] = colour

    c = size / 2

    def scaled(v: float) -> float:
        """Distance from centre, pulled in for the maskable safe zone."""
        return c + (v - c) * safe

    # The hairline border, drawn as four bars.
    inset, hair = size * 0.055, max(1.0, size * 0.016)
    b0, b1 = scaled(inset), scaled(size - inset)
    rect(b0, b0, b1, b0 + hair, LIME)
    rect(b0, b1 - hair, b1, b1, LIME)
    rect(b0, b0, b0 + hair, b1, LIME)
    rect(b1 - hair, b0, b1, b1, LIME)

    # The U: two uprights and a foot, with a squared bowl.
    stroke = size * 0.105 * safe
    w, h = size * 0.42 * safe, size * 0.44 * safe
    x0, y0 = c - w / 2, c - h / 2
    rect(x0, y0, x0 + stroke, y0 + h, LIME)
    rect(x0 + w - stroke, y0, x0 + w, y0 + h, LIME)
    rect(x0, y0 + h - stroke, x0 + w, y0 + h, LIME)

    return png(size, size, px)


TARGETS = [
    ("src/app/icon.png", 256, 1.0),
    ("src/app/apple-icon.png", 180, 1.0),
    ("public/icons/icon-192.png", 192, 1.0),
    ("public/icons/icon-512.png", 512, 1.0),
    # Maskable: artwork inside the inner 80% so no launcher crop clips the mark.
    ("public/icons/icon-maskable-512.png", 512, 0.78),
]

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    for rel, size, safe in TARGETS:
        out = root / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(mark(size, safe))
        print(f"{rel:38s} {size}px  {out.stat().st_size:>6,} B")

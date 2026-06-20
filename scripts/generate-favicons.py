"""Regenerate favicon assets with transparent background and tighter crop."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "favicon.png"
ICO_SIZES = [16, 32, 48, 64, 128, 256]
PNG_SIZES = [48, 96, 192, 512]
FILL_RATIO = 0.96
PADDING_RATIO = 0.02
BLACK_THRESHOLD = 35


def remove_black_background(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.array(rgba)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    dark = (r <= BLACK_THRESHOLD) & (g <= BLACK_THRESHOLD) & (b <= BLACK_THRESHOLD)
    arr[dark, 3] = 0
    return Image.fromarray(arr, "RGBA")


def tight_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    arr = np.array(img.convert("RGBA"))
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    mask = (a > 20) & ~((r <= BLACK_THRESHOLD) & (g <= BLACK_THRESHOLD) & (b <= BLACK_THRESHOLD))
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return 0, 0, img.width - 1, img.height - 1
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def crop_logo(source: Image.Image) -> Image.Image:
    x0, y0, x1, y1 = tight_bbox(source)
    pad_x = int((x1 - x0 + 1) * PADDING_RATIO)
    pad_y = int((y1 - y0 + 1) * PADDING_RATIO)
    x0 = max(0, x0 - pad_x)
    y0 = max(0, y0 - pad_y)
    x1 = min(source.width - 1, x1 + pad_x)
    y1 = min(source.height - 1, y1 + pad_y)
    cropped = source.crop((x0, y0, x1 + 1, y1 + 1))

    side = max(cropped.width, cropped.height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    offset = ((side - cropped.width) // 2, (side - cropped.height) // 2)
    square.paste(cropped, offset, cropped)
    return square


def render_size(logo: Image.Image, size: int) -> Image.Image:
    target = max(1, int(size * FILL_RATIO))
    scaled = logo.resize((target, target), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = ((size - target) // 2, (size - target) // 2)
    canvas.paste(scaled, offset, scaled)
    return canvas


def main() -> None:
    source = remove_black_background(Image.open(SOURCE))
    logo = crop_logo(source)

    master = render_size(logo, 256)
    master.save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(size, size) for size in ICO_SIZES],
    )

    for size in PNG_SIZES:
        render_size(logo, size).save(PUBLIC / f"icon-{size}.png", format="PNG")

    render_size(logo, 512).save(PUBLIC / "favicon.png", format="PNG")

    print("Generated transparent favicon.ico and icon sizes:", ICO_SIZES + PNG_SIZES)


if __name__ == "__main__":
    main()

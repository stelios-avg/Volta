"""Generate small photographic-style cover images for the sample events."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / "public" / "media"
W, H = 1400, 900


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(c1, c2, accent, wash=(255, 255, 255)):
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        for x in range(0, W, 2):
            t = (y / (H - 1)) * 0.82 + (x / (W - 1)) * 0.18
            color = lerp(c1, c2, t)
            px[x, y] = color
            if x + 1 < W:
                px[x + 1, y] = color
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((860, -160, 1560, 540), fill=accent + (150,))
    draw.ellipse((-220, 520, 640, 1180), fill=wash + (36,))
    draw.rectangle((0, 760, W, H), fill=(0, 0, 0, 45))
    return img


def save(img, name):
    img.save(ROOT / name, "JPEG", quality=82, optimize=True)


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    covers = {
        "food.jpg": ((120, 42, 28), (214, 122, 58), (255, 196, 92)),
        "jazz.jpg": ((16, 24, 48), (28, 58, 92), (232, 176, 92)),
        "kids.jpg": ((22, 112, 128), (244, 176, 74), (255, 244, 214)),
        "wine.jpg": ((92, 18, 40), (176, 64, 72), (244, 196, 120)),
        "village.jpg": ((92, 78, 52), (196, 132, 86), (244, 214, 160)),
        "trail.jpg": ((18, 72, 64), (86, 140, 92), (186, 214, 160)),
        "castle.jpg": ((48, 56, 78), (196, 112, 72), (255, 186, 120)),
        "theatre.jpg": ((64, 16, 28), (128, 32, 48), (232, 164, 120)),
        "beach.jpg": ((14, 92, 132), (92, 176, 186), (255, 214, 140)),
        "market.jpg": ((42, 36, 64), (168, 92, 58), (255, 196, 120)),
        "cellar.jpg": ((72, 36, 28), (150, 78, 48), (214, 168, 96)),
        "nature.jpg": ((24, 78, 48), (112, 150, 78), (210, 196, 120)),
        "odeon.jpg": ((36, 42, 64), (120, 92, 72), (232, 186, 120)),
        "craft.jpg": ((120, 72, 48), (196, 140, 96), (244, 220, 180)),
        "fallback.jpg": ((23, 35, 43), (15, 111, 120), (240, 180, 41)),
    }
    for name, colors in covers.items():
        save(gradient(*colors), name)
        print(name)


if __name__ == "__main__":
    main()

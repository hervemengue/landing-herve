"""Génère og-test-gratuit.png (1200×630) pour preview LinkedIn."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "og-test-gratuit.png"
W, H = 1200, 630


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = (
        ["arialbd.ttf", "Arial Bold.ttf", "segoeuib.ttf"]
        if bold
        else ["arial.ttf", "Arial.ttf", "segoeui.ttf"]
    )
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGB", (W, H), "#eef4ff")
    draw = ImageDraw.Draw(img)

    for y in range(H):
        t = y / H
        r = int(238 - 18 * t)
        g = int(244 - 10 * t)
        b = int(255 - 5 * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    draw.rectangle([0, 0, W, 10], fill="#2563eb")

    f_badge = load_font(28, bold=True)
    f_h1 = load_font(56, bold=True)
    f_h2 = load_font(44, bold=True)
    f_sub = load_font(32, bold=True)
    f_body = load_font(26)
    f_small = load_font(22)

    draw.rounded_rectangle([56, 56, 340, 118], radius=14, fill="#fbbf24")
    draw.text((82, 72), "TEST GRATUIT", fill="#111827", font=f_badge)

    draw.text((56, 148), "1 message adapté", fill="#0f172a", font=f_h1)
    draw.text((56, 218), "à votre métier", fill="#0f172a", font=f_h1)

    draw.text((56, 310), "Réponse à une demande · relance de devis · pas dispo", fill="#2563eb", font=f_sub)

    draw.rounded_rectangle([56, 390, 720, 540], radius=18, fill="#ffffff", outline="#cbd5e1", width=2)
    draw.text((88, 418), "Brief WhatsApp en 30 secondes", fill="#475569", font=f_body)
    draw.text((88, 462), "1. Métier  ·  2. Message qui bloque  ·  3. Prénom", fill="#0f172a", font=f_body)
    draw.text((88, 502), "→ 1 extrait sous 24 h · sans engagement", fill="#64748b", font=f_small)

    draw.rounded_rectangle([760, 420, 1144, 540], radius=18, fill="#2563eb")
    draw.text((800, 455), "Vous copiez.", fill="#ffffff", font=f_h2)
    draw.text((800, 505), "Vous envoyez.", fill="#dbeafe", font=f_body)

    draw.ellipse([56, 568, 84, 596], outline="#2563eb", width=2)
    draw.text((92, 572), "hervemengue.github.io/test-gratuit", fill="#64748b", font=f_small)

    img.save(OUT, optimize=True)
    print(f"Saved {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()

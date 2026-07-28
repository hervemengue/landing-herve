"""Optimise les images du site : le hero chargeait 4,36 Mo au-dessus de la ligne de flottaison."""
from pathlib import Path

from PIL import Image

SITE = Path(r"C:\Users\herve\Downloads\landing-herve")

# (fichier source, largeur cible) — largeur = 2x la taille d'affichage réelle
CIBLES = [
    ("demo-hero-avant-25min.png", 1040),
    ("demo-hero-apres-2min.png", 1040),
    ("og-image.png", 1200),
    ("herve-photo.png", 256),
]


def ko(p: Path) -> float:
    return round(p.stat().st_size / 1024, 1)


for nom, largeur in CIBLES:
    src = SITE / nom
    if not src.exists():
        print(f"ABSENT  {nom}")
        continue

    im = Image.open(src).convert("RGB")
    if im.width > largeur:
        hauteur = round(im.height * largeur / im.width)
        im = im.resize((largeur, hauteur), Image.LANCZOS)

    webp = src.with_suffix(".webp")
    jpg = src.with_suffix(".jpg")
    im.save(webp, "WEBP", quality=86, method=6)
    im.save(jpg, "JPEG", quality=85, optimize=True, progressive=True)

    print(
        f"{nom:32} {ko(src):>8} Ko  ->  webp {ko(webp):>6} Ko   jpg {ko(jpg):>6} Ko"
        f"   ({im.width}x{im.height})"
    )

#!/usr/bin/env python3
"""Génère une page messages client ou démo pour landing-herve."""

from __future__ import annotations

import argparse
import json
import re
import secrets
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P_DIR = ROOT / "p"

DEFAULT_MESSAGES = [
    {
        "title": "Demande client",
        "label": "Réponse à une demande",
        "text": (
            "Bonjour, merci pour votre message. Je peux passer demain entre 14 h et 16 h "
            "pour voir la situation sur place. Je vous envoie le devis dès que j'ai tout vu. "
            "Ça vous convient ?"
        ),
    },
    {
        "title": "Relance de devis",
        "label": "Devis sans réponse",
        "text": (
            "Bonjour, je me permets de revenir vers vous concernant le devis envoyé la semaine "
            "dernière. Le projet est-il toujours d'actualité ? Je suis disponible si vous "
            "avez des questions."
        ),
    },
    {
        "title": "Retard chantier",
        "label": "Prévenir le client",
        "text": (
            "Bonjour, je préfère vous prévenir que j'aurai environ 30 minutes de retard "
            "aujourd'hui en raison d'une intervention qui a pris plus de temps que prévu. "
            "Merci de votre compréhension."
        ),
    },
    {
        "title": "Demande d'avis Google",
        "label": "Fin de chantier",
        "text": (
            "Bonjour, merci encore pour votre confiance. Si vous êtes satisfait du travail "
            "réalisé, un avis Google nous aiderait beaucoup. Voici le lien : [lien]."
        ),
    },
    {
        "title": "Client mécontent",
        "label": "Réclamation",
        "text": (
            "Bonjour, merci de m'avoir informé. Je comprends votre mécontentement et je "
            "souhaite trouver une solution rapidement. Pouvez-vous m'envoyer quelques photos "
            "ou précisions sur le problème ? Je reviens vers vous dès que possible pour "
            "convenir d'une intervention."
        ),
    },
]

DEMOS = {
    "plombier": {
        "metier": "Plombier",
        "entreprise": "Exemple démo",
        "messages": [
            {
                "title": "Demande client",
                "label": "Urgence · fuite",
                "text": (
                    "Bonjour, merci pour votre message. Je peux passer demain entre 14 h et "
                    "16 h pour voir la fuite. Je vous envoie le devis dès que j'ai tout vu "
                    "sur place. Ça vous convient ?"
                ),
            },
            *DEFAULT_MESSAGES[1:],
        ],
    },
    "menuisier": {
        "metier": "Menuisier",
        "entreprise": "Exemple démo",
        "messages": [
            {
                "title": "Demande client",
                "label": "Devis fenêtres",
                "text": (
                    "Bonjour, merci pour votre demande. Je peux passer jeudi en fin "
                    "d'après-midi pour les mesures. Je vous envoie le devis sous 48 h. "
                    "Ça vous irait ?"
                ),
            },
            *DEFAULT_MESSAGES[1:],
        ],
    },
    "electricien": {
        "metier": "Électricien",
        "entreprise": "Exemple démo",
        "messages": [
            {
                "title": "Demande client",
                "label": "Tableau · Beauvais",
                "text": (
                    "Bonjour, oui j'interviens sur Beauvais et les alentours. Je peux passer "
                    "demain en fin de matinée pour diagnostiquer. Vous êtes disponible vers 11 h ?"
                ),
            },
            *DEFAULT_MESSAGES[1:],
        ],
    },
}


def slugify(value: str) -> str:
    s = value.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "client"


def render_page(
    *,
    client_name: str,
    metier: str,
    entreprise: str | None,
    messages: list[dict],
    page_type: str,
    title_suffix: str,
) -> str:
    if page_type == "demo":
        badge = '<span class="badge badge-demo">Exemple démo</span>'
        hint = (
            "Messages illustratifs pour votre métier. "
            "Vous copiez, vous envoyez — pas de robot."
        )
        h1 = f"Messages rapides — {escape(metier)}"
        robots = ""
    elif page_type == "test":
        badge = '<span class="badge badge-test">Extrait test</span>'
        hint = "Votre extrait personnalisé. Touchez « Copier » puis collez dans WhatsApp ou SMS."
        h1 = f"Messages rapides — {escape(client_name)}"
        robots = '<meta name="robots" content="noindex, nofollow">'
    else:
        badge = '<span class="badge badge-client">Vos messages</span>'
        hint = "Copier → coller dans WhatsApp ou SMS. Vous envoyez vous-même."
        h1 = f"Messages rapides — {escape(client_name)}"
        robots = '<meta name="robots" content="noindex, nofollow">'

    sub_parts = [escape(metier)]
    if entreprise:
        sub_parts.append(escape(entreprise))
    subtitle = " · ".join(sub_parts)

    cards = []
    for i, msg in enumerate(messages, start=1):
        mid = f"msg-{i}"
        cards.append(
            f"""    <article class="msg-card">
      <h2>{i} — {escape(msg["title"])}</h2>
      <p class="msg-label">{escape(msg.get("label", ""))}</p>
      <div class="msg-text" id="{mid}">{escape(msg["text"])}</div>
      <button type="button" class="copy-btn" data-target="{mid}">Copier le message</button>
    </article>"""
        )

    cards_html = "\n".join(cards)

    return f"""<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {robots}
  <title>{escape(title_suffix)}</title>
  <meta name="description" content="Messages prêts à copier — WhatsApp ou SMS.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{'messages-app.css' if page_type == 'demo' else '../messages-app.css'}">
</head>
<body>
  <div class="wrap">
    <header class="top">
      {badge}
      <h1>{h1}</h1>
      <p class="sub">{subtitle}</p>
    </header>
    <p class="hint-bar">{hint}</p>
<main>
{cards_html}
</main>
    <p class="foot">Préparé par <a href="{'index.html' if page_type == 'demo' else '../index.html'}">Hervé</a> · vous copiez, vous envoyez</p>
  </div>
  <script src="{'messages-app.js' if page_type == 'demo' else '../messages-app.js'}"></script>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Génère une page messages client.")
    parser.add_argument("--demo", choices=sorted(DEMOS.keys()), help="Génère une page démo publique")
    parser.add_argument("--nom", help="Prénom ou nom du client")
    parser.add_argument("--metier", help="Métier (plombier, électricien…)")
    parser.add_argument("--entreprise", default="", help="Nom entreprise (optionnel)")
    parser.add_argument("--slug", help="Identifiant URL (sinon généré)")
    parser.add_argument("--test", action="store_true", help="Extrait test : 1 seul message")
    parser.add_argument("--json", type=Path, help="Fichier JSON avec clé messages")
    parser.add_argument("--stdout", action="store_true", help="Affiche le HTML au lieu d'écrire")
    args = parser.parse_args()

    if args.demo:
        demo = DEMOS[args.demo]
        html = render_page(
            client_name="",
            metier=demo["metier"],
            entreprise=demo["entreprise"],
            messages=demo["messages"],
            page_type="demo",
            title_suffix=f"Démo {demo['metier']} — messages prêts",
        )
        out = ROOT / f"demo-{args.demo}.html"
        out.write_text(html, encoding="utf-8")
        print(f"Écrit : {out}")
        print(f"URL : https://hervemengue.github.io/landing-herve/demo-{args.demo}.html")
        return 0

    if not args.nom or not args.metier:
        parser.error("--nom et --metier sont obligatoires (ou utilisez --demo)")

    messages = DEFAULT_MESSAGES
    if args.json:
        data = json.loads(args.json.read_text(encoding="utf-8"))
        messages = data["messages"]

    if args.test:
        messages = messages[:1]
        page_type = "test"
        title = f"Test — {args.nom} — messages prêts"
    else:
        page_type = "client"
        title = f"{args.nom} — messages prêts"

    slug = args.slug or f"{slugify(args.nom)}-{secrets.token_hex(3)}"
    P_DIR.mkdir(exist_ok=True)

    html = render_page(
        client_name=args.nom,
        metier=args.metier,
        entreprise=args.entreprise or None,
        messages=messages,
        page_type=page_type,
        title_suffix=title,
    )

    out = P_DIR / f"{slug}.html"
    if args.stdout:
        print(html)
        return 0

    out.write_text(html, encoding="utf-8")
    url = f"https://hervemengue.github.io/landing-herve/p/{slug}.html"
    print(f"Écrit : {out}")
    print(f"URL à envoyer : {url}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

# Pages client — messages prêts

**URL publique :** `https://hervemengue.github.io/landing-herve/p/{slug}.html`

Les pages client ne sont **pas** dans le sitemap (noindex).

## Démos (à envoyer sur WhatsApp)

| Métier | Lien |
|--------|------|
| Plombier | https://hervemengue.github.io/landing-herve/demo-plombier.html |
| Menuisier | https://hervemengue.github.io/landing-herve/demo-menuisier.html |
| Électricien | https://hervemengue.github.io/landing-herve/demo-electricien.html |

## Créer une page client (test ou pack 49 €)

### Extrait test (1 message)

```powershell
cd landing-herve
python scripts/build_client_page.py --nom "Jean" --metier "Plombier" --test
```

### Pack complet (5 messages)

```powershell
python scripts/build_client_page.py --nom "Jean" --metier "Plombier" --entreprise "Plomberie Jean"
```

### Messages personnalisés (JSON)

Copier `scripts/exemple-messages.json`, modifier, puis :

```powershell
python scripts/build_client_page.py --nom "Jean" --metier "Menuisier" --json scripts/exemple-messages.json
```

Le script affiche l’**URL à envoyer** sur WhatsApp.

## Registre (à tenir à la main)

| Date | Client | Slug | Type | URL |
|------|--------|------|------|-----|
| | | | test / pack | |

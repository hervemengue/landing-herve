# Assist instantané — API Cloudflare Worker

Proxy entre la webapp (`demo-plombier.html`) et OpenAI. La clé API **ne** va jamais dans le navigateur.

## Prérequis

- Compte [Cloudflare](https://dash.cloudflare.com) (gratuit)
- Clé [OpenAI API](https://platform.openai.com/api-keys)
- Node.js 18+ (pour `wrangler`)

## Déploiement (~10 min)

```powershell
cd c:\Users\herve\Downloads\landing-herve\worker
npm init -y
npm install -D wrangler
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
# Coller ta clé OpenAI quand demandé
npx wrangler deploy
```

À la fin, Wrangler affiche une URL du type :

```
https://assist-instant-api.<ton-compte>.workers.dev
```

## Activer sur la démo plombier

Éditer `assist-instant-config.js` à la racine du site :

```javascript
window.ASSIST_INSTANT_CONFIG = {
  apiUrl: "https://assist-instant-api.<ton-compte>.workers.dev/api/generate",
};
```

Commit + push `landing-herve`.

## Test

1. Ouvrir https://hervemengue.github.io/landing-herve/demo-plombier.html sur **Chrome mobile**
2. Bloc **Nouvelle situation** → écrire ou **Parler**
3. **Générer le message** → **Copier**

### 3 dictées test (Hervé)

| # | Situation |
|---|-----------|
| 1 | Client demande dispo demain pour une fuite cuisine |
| 2 | Retard 45 minutes chez le client |
| 3 | Client agressif sur le prix du devis |

## Coût

- Worker : **0 €** (free tier)
- OpenAI gpt-4o-mini : ~**0,0003 €** / génération

## Fichiers client

Config JSON publique (noindex) :

```
p/data/{slug}.json
```

Généré automatiquement avec `scripts/build_client_page.py` (pack client).

## Dépannage

| Problème | Solution |
|----------|----------|
| « API non configurée » | Remplir `apiUrl` dans `assist-instant-config.js` |
| CORS error | Vérifier `ALLOWED_ORIGINS` dans `wrangler.toml` |
| 503 OPENAI_API_KEY | `npx wrangler secret put OPENAI_API_KEY` |
| Micro grisé | Utiliser Chrome · autoriser micro |

/**
 * Assist instantané — proxy OpenAI pour webapp messages artisan.
 */

function parseOrigins(raw) {
  return String(raw || "https://hervemengue.github.io")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin, allowedOrigins) {
  const allowed = allowedOrigins.some(
    (o) => origin === o || origin.startsWith(o.replace(/\/$/, ""))
  );
  const allowOrigin = allowed ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(body, status, origin, allowedOrigins) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin, allowedOrigins),
    },
  });
}

const rateBuckets = new Map();

function checkRateLimit(slug) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxPerMinute = 10;
  let bucket = rateBuckets.get(slug);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(slug, bucket);
  }
  bucket.count += 1;
  return bucket.count <= maxPerMinute;
}

function buildSystemPrompt(client) {
  const refs = (client.messages || [])
    .map((m, i) => `${i + 1}. [${m.label || m.title}] ${m.text}`)
    .join("\n");

  const rules = (client.rules || []).map((r) => `- ${r}`).join("\n");

  return `Tu rédiges UN message que l'artisan enverra lui-même à son client (WhatsApp ou SMS).
Métier : ${client.metier || "Artisan"}
Entreprise : ${client.entreprise || client.client_name || ""}
Ton : ${client.ton || "poli, professionnel, vouvoiement"}

Textes de référence (même style, même registre) :
${refs}

Règles :
${rules}

Réponds UNIQUEMENT avec le texte du message client, prêt à copier-coller.
Pas de guillemets · pas d'explication · pas de markdown · français · 2 à 6 phrases max.`;
}

async function fetchClientConfig(slug, dataBase) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Identifiant client invalide");
  }
  const base = dataBase.endsWith("/") ? dataBase : dataBase + "/";
  const res = await fetch(`${base}${slug}.json`, { cf: { cacheTtl: 300 } });
  if (!res.ok) throw new Error("Configuration client introuvable");
  return res.json();
}

async function callOpenAI(systemPrompt, situation, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 280,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Situation décrite par l'artisan :\n${situation}`,
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Erreur OpenAI");
  }

  const reply = (data.choices?.[0]?.message?.content || "").trim();
  if (!reply) throw new Error("Réponse vide");
  return reply.replace(/^["']|["']$/g, "");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "https://hervemengue.github.io";
    const allowedOrigins = parseOrigins(env.ALLOWED_ORIGINS);
    const dataBase =
      env.CLIENT_DATA_BASE ||
      "https://hervemengue.github.io/landing-herve/p/data/";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigins),
      });
    }

    if (url.pathname !== "/api/generate" || request.method !== "POST") {
      return jsonResponse({ error: "Not found" }, 404, origin, allowedOrigins);
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        { error: "API non configurée (OPENAI_API_KEY)" },
        503,
        origin,
        allowedOrigins
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "JSON invalide" }, 400, origin, allowedOrigins);
    }

    const slug = String(body.slug || "").trim();
    const situation = String(body.situation || "").trim();

    if (!slug || situation.length < 8) {
      return jsonResponse(
        { error: "slug et situation requis (8 caractères min.)" },
        400,
        origin,
        allowedOrigins
      );
    }

    if (!checkRateLimit(slug)) {
      return jsonResponse(
        { error: "Trop de requêtes — réessayez dans une minute." },
        429,
        origin,
        allowedOrigins
      );
    }

    try {
      const client = await fetchClientConfig(slug, dataBase);
      const systemPrompt = buildSystemPrompt(client);
      const reply = await callOpenAI(systemPrompt, situation, apiKey);
      const label =
        situation.length > 48 ? situation.slice(0, 45) + "…" : situation;
      return jsonResponse({ reply, label }, 200, origin, allowedOrigins);
    } catch (err) {
      return jsonResponse(
        { error: err.message || "Erreur interne" },
        500,
        origin,
        allowedOrigins
      );
    }
  },
};

// Shared server-side helpers for the voice endpoints.
// Secrets come from Vercel environment variables and never reach the browser.

const SARVAM = "https://api.sarvam.ai";

function config() {
  const sarvamKey = process.env.SARVAM_API_KEY;
  const supaUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const supaKey = process.env.SUPABASE_SECRET_KEY;
  const cisco = {
    clientId: process.env.CISCO_CLIENT_ID,
    clientSecret: process.env.CISCO_CLIENT_SECRET,
    appKey: process.env.CISCO_APP_KEY,
    tokenUrl:
      process.env.CISCO_TOKEN_URL ||
      "https://id.cisco.com/oauth2/default/v1/token",
    apiBase: (
      process.env.CISCO_API_BASE || "https://chat-ai.cisco.com"
    ).replace(/\/+$/, ""),
    apiVersion: process.env.CISCO_API_VERSION || "2024-12-01-preview",
    // Gemini 3.6 Flash on the Cisco gateway. It is a "thinking" model, so
    // requests must leave token headroom for reasoning_tokens (see ciscoChat).
    deployment: process.env.CISCO_DEPLOYMENT || "gemini-3.6-flash",
  };
  return { sarvamKey, supaUrl, supaKey, cisco };
}

function ciscoReady(cfg) {
  const c = cfg.cisco || {};
  return Boolean(c.clientId && c.clientSecret && c.appKey);
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return req.body;
}

// --- Sarvam ---------------------------------------------------------------

async function transcribe(sarvamKey, bytes, filename, mimeType) {
  const form = new FormData();
  form.append(
    "file",
    new Blob([bytes], { type: mimeType || "audio/m4a" }),
    filename || "input.m4a",
  );
  form.append("model", "saaras:v3");
  form.append("language_code", "unknown"); // auto-detect the spoken language
  form.append("mode", "transcribe");

  const res = await fetch(`${SARVAM}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": sarvamKey },
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`STT ${res.status}: ${detail.slice(0, 300)}`);
  }
  const j = await res.json();
  return {
    transcript: j.transcript || "",
    language_code: j.language_code || "unknown",
  };
}

async function translate(sarvamKey, input, source, target) {
  const res = await fetch(`${SARVAM}/translate`, {
    method: "POST",
    headers: {
      "api-subscription-key": sarvamKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      source_language_code: source,
      target_language_code: target,
      model: "sarvam-translate:v1",
    }),
  });
  if (!res.ok) {
    return null;
  }
  const j = await res.json();
  return typeof j.translated_text === "string" ? j.translated_text : null;
}

// Bulbul v3: never send pitch/loudness (rejected by the API).
async function textToSpeech(sarvamKey, text, language, speaker) {
  const res = await fetch(`${SARVAM}/text-to-speech`, {
    method: "POST",
    headers: {
      "api-subscription-key": sarvamKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language,
      speaker: speaker || "priya",
      model: "bulbul:v3",
      speech_sample_rate: 22050,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`TTS ${res.status}: ${detail.slice(0, 300)}`);
  }
  const j = await res.json();
  if (!j.audios || !j.audios[0]) {
    throw new Error("TTS returned no audio");
  }
  return j.audios[0]; // base64 wav
}

// --- Cisco LLM (Okta client-credentials -> Azure-style chat) --------------

// Cache the bearer token across warm invocations until shortly before expiry.
let ciscoToken = { value: null, expiresAt: 0 };

async function ciscoAccessToken(cfg) {
  const now = Date.now();
  if (ciscoToken.value && now < ciscoToken.expiresAt - 60000) {
    return ciscoToken.value;
  }
  const c = cfg.cisco;
  const basic = Buffer.from(`${c.clientId}:${c.clientSecret}`).toString(
    "base64",
  );
  const res = await fetch(c.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Cisco token ${res.status}: ${detail.slice(0, 200)}`);
  }
  const j = await res.json();
  if (!j.access_token) {
    throw new Error("Cisco token response had no access_token");
  }
  const ttlMs = (Number(j.expires_in) || 3600) * 1000;
  ciscoToken = { value: j.access_token, expiresAt: now + ttlMs };
  return j.access_token;
}

// Chat completion via the Cisco Azure-OpenAI gateway. `messages` is the
// standard [{ role, content }] array. Returns the assistant's text.
async function ciscoChat(cfg, messages, opts) {
  const options = opts || {};
  const token = await ciscoAccessToken(cfg);
  const c = cfg.cisco;
  const url = `${c.apiBase}/openai/deployments/${c.deployment}/chat/completions?api-version=${c.apiVersion}`;
  // No max_tokens cap: thinking models (Gemini 3.6) spend reasoning_tokens
  // before visible output, so any cap risks truncating the reply mid-sentence.
  const payload = {
    messages,
    user: JSON.stringify({ appkey: c.appKey }),
    temperature:
      typeof options.temperature === "number" ? options.temperature : 0.6,
  };
  if (typeof options.maxTokens === "number") {
    payload.max_tokens = options.maxTokens;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": token },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Cisco chat ${res.status}: ${detail.slice(0, 300)}`);
  }
  const j = await res.json();
  const text =
    j &&
    j.choices &&
    j.choices[0] &&
    j.choices[0].message &&
    j.choices[0].message.content;
  if (typeof text !== "string") {
    throw new Error("Cisco chat returned no message content");
  }
  return text.trim();
}

// --- Supabase (REST + Storage, service key) -------------------------------

function supaHeaders(supaKey, extra) {
  return Object.assign(
    { apikey: supaKey, Authorization: `Bearer ${supaKey}` },
    extra || {},
  );
}

async function insertUtterance(cfg, row) {
  try {
    await fetch(`${cfg.supaUrl}/rest/v1/utterances`, {
      method: "POST",
      headers: supaHeaders(cfg.supaKey, {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify(row),
    });
  } catch (error) {
    // Storing history is best-effort; never fail the voice turn on it.
  }
}

async function getSession(cfg, id) {
  if (!id) return null;
  try {
    const res = await fetch(
      `${cfg.supaUrl}/rest/v1/sessions?id=eq.${encodeURIComponent(
        id,
      )}&select=id,language,context,meta`,
      { headers: supaHeaders(cfg.supaKey, { Accept: "application/json" }) },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch (error) {
    return null;
  }
}

async function patchSession(cfg, id, patch) {
  if (!id) return;
  try {
    await fetch(
      `${cfg.supaUrl}/rest/v1/sessions?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: supaHeaders(cfg.supaKey, {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        }),
        body: JSON.stringify(patch),
      },
    );
  } catch (error) {
    // Best-effort; tutor flow must not fail on state persistence.
  }
}

async function uploadAudio(cfg, path, bytes) {
  const res = await fetch(
    `${cfg.supaUrl}/storage/v1/object/audio/${path}`,
    {
      method: "POST",
      headers: supaHeaders(cfg.supaKey, { "Content-Type": "audio/wav" }),
      body: bytes,
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`storage ${res.status}: ${detail.slice(0, 200)}`);
  }
  return `${cfg.supaUrl}/storage/v1/object/public/audio/${path}`;
}

module.exports = {
  config,
  ciscoReady,
  ciscoChat,
  readBody,
  transcribe,
  translate,
  textToSpeech,
  insertUtterance,
  uploadAudio,
  getSession,
  patchSession,
};

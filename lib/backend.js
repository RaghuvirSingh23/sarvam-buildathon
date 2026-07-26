// Shared server-side helpers for the voice endpoints.
// Secrets come from Vercel environment variables and never reach the browser.

const SARVAM = "https://api.sarvam.ai";

function config() {
  const sarvamKey = process.env.SARVAM_API_KEY;
  const supaUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const supaKey = process.env.SUPABASE_SECRET_KEY;
  return { sarvamKey, supaUrl, supaKey };
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
  readBody,
  transcribe,
  translate,
  textToSpeech,
  insertUtterance,
  uploadAudio,
};

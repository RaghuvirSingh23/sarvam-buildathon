// Voice IN: audio (any language) -> transcript (original) + detected language
// + English translation. Both stored in public.utterances. Sarvam key stays
// server-side.
//
//   POST /api/listen
//   { audioBase64, mimeType?, filename?, sessionId?, speakerId? }
//   -> { transcript, language_code, text_en, needsReprompt }

const {
  config,
  readBody,
  transcribe,
  translate,
  insertUtterance,
} = require("../lib/backend");

// Guard against oversized uploads (~12MB of base64 ≈ 9MB audio).
const MAX_BASE64_LENGTH = 12 * 1024 * 1024;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "POST only" });
    return;
  }

  const cfg = config();
  if (!cfg.sarvamKey || !cfg.supaUrl || !cfg.supaKey) {
    res.status(503).json({ error: "Voice backend is not configured." });
    return;
  }

  try {
    const body = readBody(req);
    const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
    if (!audioBase64) {
      res.status(400).json({ error: "no audio" });
      return;
    }
    if (audioBase64.length > MAX_BASE64_LENGTH) {
      res.status(413).json({ error: "audio too large" });
      return;
    }

    const bytes = Buffer.from(audioBase64, "base64");
    const stt = await transcribe(
      cfg.sarvamKey,
      bytes,
      typeof body.filename === "string" ? body.filename : "input.m4a",
      typeof body.mimeType === "string" ? body.mimeType : "audio/m4a",
    );

    const text = stt.transcript;
    const lang = stt.language_code;

    let text_en = text;
    if (text.trim() && lang !== "en-IN") {
      const translated = await translate(
        cfg.sarvamKey,
        text,
        lang === "unknown" ? "auto" : lang,
        "en-IN",
      );
      if (translated) {
        text_en = translated;
      }
    }

    await insertUtterance(cfg, {
      session_id: typeof body.sessionId === "string" ? body.sessionId : null,
      speaker_id: typeof body.speakerId === "string" ? body.speakerId : null,
      kind: "input",
      lang,
      text,
      text_en,
    });

    res.status(200).json({
      transcript: text,
      language_code: lang,
      text_en,
      needsReprompt: text.trim() === "",
    });
  } catch (error) {
    res.status(502).json({ error: String(error && error.message ? error.message : error) });
  }
};

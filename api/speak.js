// Voice OUT: English reply text -> translated to the speaker's language ->
// Bulbul v3 TTS -> wav stored in the public "audio" bucket -> playable URL.
// Stored in public.utterances.
//
//   POST /api/speak
//   { text, language?, speaker?, sessionId?, speakerId? }
//   -> { url, text, text_en }

const crypto = require("crypto");
const {
  config,
  readBody,
  translate,
  textToSpeech,
  uploadAudio,
  insertUtterance,
} = require("../lib/backend");

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
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      res.status(400).json({ error: "no text" });
      return;
    }
    const language = typeof body.language === "string" ? body.language : "pa-IN";
    const speaker = typeof body.speaker === "string" ? body.speaker : "priya";

    // 1) Translate English -> speaker's language (skip if already English).
    let localized = text;
    if (language !== "en-IN") {
      const translated = await translate(cfg.sarvamKey, text, "en-IN", language);
      if (translated) {
        localized = translated;
      }
    }

    // 2) TTS in that language.
    const audioB64 = await textToSpeech(cfg.sarvamKey, localized, language, speaker);

    // 3) Store the wav and return a playable URL.
    const bytes = Buffer.from(audioB64, "base64");
    const path = `tts/${crypto.randomUUID()}.wav`;
    const url = await uploadAudio(cfg, path, bytes);

    await insertUtterance(cfg, {
      session_id: typeof body.sessionId === "string" ? body.sessionId : null,
      speaker_id: typeof body.speakerId === "string" ? body.speakerId : null,
      kind: "reply",
      lang: language,
      text: localized,
      text_en: text,
      audio_url: url,
    });

    res.status(200).json({ url, text: localized, text_en: text });
  } catch (error) {
    res.status(502).json({ error: String(error && error.message ? error.message : error) });
  }
};

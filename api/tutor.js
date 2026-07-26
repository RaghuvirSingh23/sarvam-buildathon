// TUTOR (Yén): turns the child's English input into the next spoken step.
// First input in a session = ASK; every input after = NUDGE. The true reason
// ("answer") is generated once on the ASK turn and kept in the session's meta.
//
//   POST /api/tutor
//   { sessionId, childText, language? }
//   -> { reply, step, question }
//
// The Cisco LLM key stays server-side. If Cisco is not configured (or errors),
// a gentle scripted fallback keeps the voice loop working end to end.

const {
  config,
  ciscoReady,
  ciscoChat,
  readBody,
  getSession,
  patchSession,
} = require("../lib/backend");

// The ENTIRE Yén prompt: the ALWAYS rules plus all three STEP definitions.
// Sent once as the system message and carried in every request. Each turn we
// append only a short "STEP = ..." directive + the child's line as a user turn.
const YEN_SYSTEM = [
  "You are Yén, a warm, simple friend for a young child (age 5–11). You help them stay",
  "curious and figure things out for themselves — you never just hand over the answer.",
  "",
  "ALWAYS:",
  "- FIRST connect to what the child just said: answer their question, or agree with the",
  "  true part of their idea, in your own words. Only THEN add anything new. Never reply",
  "  with something unrelated to their last line.",
  "- Take them just ONE small step further each turn. Give the FULL reason only at REVEAL.",
  "- At most two short, simple sentences. Spoken aloud: no lists, emojis, or big words.",
  "- Warm and encouraging; never say the child is wrong.",
  "- Stay with the child's OWN example. No metaphors, made-up stories, or new objects.",
  "",
  "Do only the STEP you are told this turn.",
  "",
  "STEP = ASK",
  "Warmly take the child's question and ask what THEY think, using their own example",
  '(vary your words, not always "what do you think"). Give no part of the reason yet.',
  "",
  "STEP = NUDGE",
  "First react to their exact words — answer what they asked, or confirm the part they",
  "got right. Then add ONE small new clue that builds directly on what they said. Don't",
  "jump ahead, don't repeat an old hint, don't give the full reason.",
  "",
  "STEP = REVEAL",
  "Warmly praise their effort in one line, then give the full reason in ONE simple",
  "sentence, using the guidance reason without changing it.",
].join("\n");

// The system message = whole prompt + the private guidance reason (once known).
function fullSystem(answer) {
  if (answer && answer.trim()) {
    return `${YEN_SYSTEM}\n\nReason, for your guidance only (never say it before REVEAL): "${answer.trim()}".`;
  }
  return YEN_SYSTEM;
}

// Per-turn user message: the step type + the child's spoken line (in English).
function stepDirective(step, childText) {
  const label =
    step === "ask"
      ? "STEP = ASK"
      : step === "reveal"
        ? "STEP = REVEAL"
        : "STEP = NUDGE";
  const verb = step === "ask" ? "The child just asked" : "The child said";
  return `${label}\n${verb}: "${childText}"`;
}

// One true, child-simple reason for the original question. Guidance only.
async function generateAnswer(cfg, question) {
  const messages = [
    {
      role: "system",
      content:
        "You are a knowledgeable, kind teacher. Give the single true reason or answer " +
        "to a young child's question in ONE simple sentence a 5-11 year old can " +
        "understand. Reply with only that sentence — no preamble, no quotes.",
    },
    { role: "user", content: question },
  ];
  return ciscoChat(cfg, messages, { temperature: 0.3 });
}

// Prior turns, verbatim (each user turn already carries its "STEP = ..."
// directive), so the model always sees the entire thread so far.
function historyMessages(context) {
  if (!Array.isArray(context)) return [];
  return context
    .filter(function (t) {
      return (
        t &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim()
      );
    })
    .slice(-20)
    .map(function (t) {
      return { role: t.role, content: t.content };
    });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "POST only" });
    return;
  }

  const cfg = config();
  try {
    const body = readBody(req);
    const childText =
      typeof body.childText === "string" ? body.childText.trim() : "";
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId : null;
    if (!childText) {
      res.status(400).json({ error: "no childText" });
      return;
    }

    const session = await getSession(cfg, sessionId);
    const meta =
      session && session.meta && typeof session.meta === "object"
        ? session.meta
        : {};
    const tutor = meta.tutor && typeof meta.tutor === "object" ? meta.tutor : {};
    // Prior turns only — the tutor owns context, so this never includes the
    // current line yet. This is the shared thread ASK and every NUDGE build on.
    const priorContext =
      session && Array.isArray(session.context) ? session.context : [];
    const history = historyMessages(priorContext);

    const isFirst = !tutor.question;
    const step = isFirst ? "ask" : "nudge";

    let answer = typeof tutor.answer === "string" ? tutor.answer : "";
    let question = typeof tutor.question === "string" ? tutor.question : "";
    if (isFirst) {
      question = childText;
    }

    // This turn's user message: "STEP = ASK/NUDGE" + the child's spoken line.
    const directive = stepDirective(step, childText);

    // Scripted fallback keeps the voice loop alive if Cisco is unavailable
    // (missing creds, bad token, gateway error).
    const fallbackReply = isFirst
      ? "Ooh, that is a great question! What do you think the answer might be?"
      : "That is interesting! Can you tell me a little more about why you think that?";

    let reply = fallbackReply;
    if (ciscoReady(cfg)) {
      try {
        // On the first turn, work out the true reason once (private guidance).
        if (isFirst) {
          try {
            answer = await generateAnswer(cfg, question);
          } catch (error) {
            answer = "";
          }
        }
        // entire prompt (system) + entire thread so far + this turn's directive.
        const messages = [{ role: "system", content: fullSystem(answer) }]
          .concat(history)
          .concat([{ role: "user", content: directive }]);
        reply = await ciscoChat(cfg, messages);
      } catch (error) {
        reply = fallbackReply;
      }
    }

    // Persist tutor state AND the conversation turns in one authoritative
    // write, so the next turn sees a consistent, race-free context. Keep the
    // last 40 turns to bound growth.
    const nextMeta = Object.assign({}, meta, {
      tutor: {
        question,
        answer,
        turns: (Number(tutor.turns) || 0) + 1,
        lastStep: step,
      },
    });
    const nextContext = priorContext
      .concat([
        { role: "user", content: directive },
        { role: "assistant", content: reply },
      ])
      .slice(-40);
    const patch = { meta: nextMeta, context: nextContext };
    if (typeof body.language === "string" && body.language) {
      patch.language = body.language;
    }
    await patchSession(cfg, sessionId, patch);

    res.status(200).json({ reply, step, question });
  } catch (error) {
    res
      .status(502)
      .json({ error: String(error && error.message ? error.message : error) });
  }
};

# Sarvam Buildathon Skills

Reusable Codex skills for building and reviewing web products that align with
Sarvam AI's current public brand and web experience.

## Drishti iOS prototype

[`mobile/`](mobile/README.md) contains a functional Expo app with a fixed
bottom chat composer, permission-aware camera toggle, live preview, camera
switching, photo capture, and message attachments.

Run it on a physical iPhone with Expo Go:

```bash
cd mobile
npm install
npm start
```

The UI is Sarvam-aligned but uses an original identity and licensed substitute
fonts. A live Sarvam inference endpoint is not yet connected.

## Skills

| Skill | Use it for |
| --- | --- |
| [`build-sarvam-web`](skills/build-sarvam-web/SKILL.md) | Build a responsive Sarvam-aligned website or product UI from verified tokens, component recipes, and implementation guardrails. |
| [`review-sarvam-web`](skills/review-sarvam-web/SKILL.md) | Audit an implementation for brand fidelity, responsive behavior, motion, and accessibility before a demo or submission. |

Example prompts:

```text
Use $build-sarvam-web to create the landing page for our multilingual voice product.
Use $review-sarvam-web to audit this app before the buildathon demo.
```

The research snapshot is dated **2026-07-23** and is grounded in Sarvam's
[official home page](https://www.sarvam.ai/) and
[official brand page](https://www.sarvam.ai/brand). The live site can change,
so the skills require a freshness check before work that claims pixel-level
parity.

The repository records observed font family names and public asset URLs, but
does not redistribute Sarvam's font binaries, logos, or imagery. Obtain
authorization from Sarvam and each applicable rightsholder before using them;
event participation alone may not grant those rights.

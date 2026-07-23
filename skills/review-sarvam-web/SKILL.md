---
name: review-sarvam-web
description: Audit an existing website, frontend, design mockup, or product flow for fidelity to Sarvam AI's current public web brand, including typography, colors, gradients, layout, component styling, responsive behavior, motion, content voice, and accessibility. Use before Sarvam buildathon demos, design sign-off, frontend handoff, pull requests, or whenever a user asks to review, compare, QA, or make an interface feel more like Sarvam.
---

# Review Sarvam Web

Review the rendered experience first and use source inspection to explain what
caused visible drift. Do not score brand fidelity from class names alone.

## Load the baseline

Read:

1. [critical-baseline.md](references/critical-baseline.md) for the independent
   typography, color, layout, and component snapshot.
2. [fidelity-rubric.md](references/fidelity-rubric.md) for scoring and severity.

When the sibling `$build-sarvam-web` skill is available, also read its detailed
brand, token, component, motion, and source references.

## Review workflow

1. Confirm whether the target is intended to be officially Sarvam-branded or
   merely Sarvam-aligned.
2. Inspect the existing repository and run its normal checks without changing
   files.
3. Render every in-scope route at 390 × 844 and 1280 × 720.
4. Add 768 × 1024 and 1024 × 768 for navigation, grid, or dense product flows.
5. Capture the initial viewport and representative lower-page sections.
6. Test keyboard navigation, visible focus, zoom, long labels, reduced motion,
   and any interactive product demonstration.
7. Resolve this skill's absolute directory, then run its static signal checker
   against the target directory. Set the mode chosen in step 1:

```bash
python3 <path-to-review-sarvam-web>/scripts/audit_sarvam_ui.py \
  --mode aligned \
  /path/to/frontend
```

Use `--mode official` when exact Sarvam families and authorized marks are
required. In aligned mode, expose explicit display, body, and metadata roles
through `--sarvam-font-display`, `--sarvam-font-body`, and
`--sarvam-font-metadata` (or `--font-display/body/metadata`,
`--*-font-role-display/body/metadata` equivalents) so the checker can
distinguish intentional named substitutes from unconfigured generic typography.

8. Compare the rendered result with the rubric. Treat static signals as
   supporting evidence, not proof of visual quality.
9. Report issues in severity order with a concrete fix and the affected
   viewport or component.

## Evidence standards

Use one of these labels:

- **Observed mismatch:** Visible or interactive drift confirmed in a render.
- **Source mismatch:** Code or tokens directly contradict the baseline.
- **Missing evidence:** A required state, viewport, font license, or asset could
  not be verified.
- **Recommendation:** A design improvement inferred from the brand logic rather
  than an exact public-site rule.

Do not call an interface pixel-perfect when the exact fonts or official artwork
are unavailable. Do not penalize a product for omitting a Sarvam marketing
section that its information architecture does not need.

## Blockers

Treat these as release blockers for a buildathon submission:

- horizontal overflow or clipped fixed headers at 390 px;
- missing or unreadable primary CTA;
- absent keyboard focus or inaccessible core controls;
- body text below a comfortable readable size;
- low-contrast text over the hero gradient;
- broken Indic-script shaping or missing glyphs;
- motion that ignores reduced-motion preferences;
- copied customer proof or brand marks without permission;
- a generic template look caused by default fonts, blue-purple gradients,
  repetitive cards, or mismatched radii.

## Review output

Return:

1. a 0–100 rubric score and confidence level;
2. the three highest-impact fixes;
3. blocker, major, and minor findings;
4. viewport-specific evidence;
5. static-check output and any false-positive caveats;
6. licensing or provenance gaps;
7. a clear ship/no-ship recommendation for the stated context.

If the user requested implementation as well as review, fix in priority order,
rerender the changed states, and report the score delta.

## Freshness

The baseline was captured on 2026-07-23. Re-check the official home and brand
pages before claiming current parity. If they have changed, update both Sarvam
skills and their validators together before scoring the target against a new
system.

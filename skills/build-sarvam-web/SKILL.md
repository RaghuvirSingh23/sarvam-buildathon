---
name: build-sarvam-web
description: Build or restyle responsive websites and product interfaces to match Sarvam AI's current public brand system, including typography, color, gradients, layout, components, motion, voice, and accessibility. Use for Sarvam buildathon prototypes, Sarvam-branded landing pages, dashboards, demos, product flows, component libraries, or frontend implementation tasks that ask for Sarvam styling, visual parity, or brand consistency.
---

# Build Sarvam Web

Build a product that feels native to Sarvam's visual system without copying
irrelevant page content or weakening the product's usability.

## Start with the evidence

Read the following files before making visual decisions:

1. Read [brand-foundations.md](references/brand-foundations.md) for the idea,
   voice, marks, and official-versus-inspired usage boundary.
2. Read [design-tokens.md](references/design-tokens.md) for exact observed
   fonts, colors, type sizes, spacing, radii, gradients, and breakpoints.
3. Read [components-and-layout.md](references/components-and-layout.md) for
   page architecture and component recipes.
4. Read [motion-and-accessibility.md](references/motion-and-accessibility.md)
   when implementing interaction, animation, responsive behavior, or forms.
5. Read [source-evidence.md](references/source-evidence.md) when checking
   provenance, asset URLs, or whether the snapshot may be stale.

Treat `assets/sarvam-theme.css` and `assets/sarvam-theme.tokens.json` as the
machine-readable snapshot. Do not improvise near-match colors when a recorded
token exists.

## Choose the brand mode

Set one of these modes before implementation:

- **Official Sarvam mode:** Use Sarvam's wordmark, monogram, imagery, and exact
  font files only when Sarvam and each applicable rightsholder authorize the
  intended use, or explicit event terms grant those specific rights. Preserve
  the official artwork; never redraw, stretch, recolor, or approximate it.
- **Sarvam-aligned mode:** Use the design logic, palette, hierarchy, and
  interaction patterns without using protected marks or implying endorsement.
  Use licensed substitutes if the exact fonts are unavailable.

Default to Sarvam-aligned mode when authorization is unknown. Exact visual
parity requires licensed copies of Matter, Matter Semi Mono, and Season Mix.
Do not hotlink production assets or font files from `sarvam.ai`.

## Build workflow

1. Inspect the existing repository, framework, routes, and user changes.
2. Preserve the product's information architecture unless the brief requests a
   redesign.
3. Map the product content into Sarvam's hierarchy:
   eyebrow, decisive display headline, short supporting copy, paired actions,
   product demonstration, proof, deeper system explanation, and closing CTA.
4. Copy `assets/sarvam-theme.css` into the app's styling layer or translate its
   values into the project's token system. Keep the token names traceable.
5. Configure the licensed font files locally. Use `font-display: swap`, the
   recorded variable-weight ranges, and language-capable fallbacks.
6. Build mobile-first. Use the 390 px composition as a required baseline, then
   validate at 768 px, 1024 px, and 1280 px.
7. Prefer large quiet surfaces, strong vertical rhythm, thin borders, rounded
   pills, editorial display type, and continuous light/color transitions.
8. Use the blue-to-orange spectrum as a signal of flow or changing state, not
   as arbitrary decoration on every section.
9. Add motion only where it explains flow, status, or hierarchy. Honor
   `prefers-reduced-motion`.
10. Render the result, compare it at desktop and mobile sizes, and fix visible
    drift before declaring completion.

## Non-negotiable visual rules

- In official mode, use `Season Mix` for display headings and prominent CTA
  labels, `Matter` for body/UI, and `Matter Semi Mono` for compact metadata.
- In aligned mode, use licensed role-equivalent substitutes, declare the
  substitution through `--sarvam-font-display`, `--sarvam-font-body`, and
  `--sarvam-font-metadata`, and preserve the recorded metrics and hierarchy.
- Use the near-black and warm off-white surfaces; avoid pure black page
  backgrounds unless a specific dark panel needs it.
- Keep body copy readable at 16/24 and touch targets at least 44 px.
- Use full pills for primary actions and 12–20 px radii for most cards.
- Use sparse 1 px borders and subtle inset lines instead of heavy shadows.
- Keep desktop content within 1400 px and primary reading columns near 1152 px.
- Collapse desktop navigation into a compact mobile header below 1024 px.
- Keep the product itself clear. Brand fidelity never justifies illegible
  gradients, inaccessible contrast, clipped content, or motion sickness.

## Content rules

- Write concise, assured, human copy grounded in a real user outcome.
- Balance technical seriousness with everyday accessibility.
- Use Indian languages, contexts, or proof only when they are authentic to the
  product.
- Avoid ornamental stereotypes, nostalgia, and indiscriminate cultural motifs.
- Do not copy Sarvam's marketing claims, customer logos, testimonials, or
  statistics into another product.

## Validate

Resolve the skill's absolute directory, then run its validator against the
theme file actually used by the target app:

```bash
python3 <path-to-build-sarvam-web>/scripts/validate_theme.py \
  --css <path-to-target-theme.css> \
  --mode aligned
```

Use `--mode official` when the authorized Sarvam families and their recorded
`@font-face` ranges are required.

Then invoke `$review-sarvam-web` when available for an independent visual and
responsive pass. Report any licensing-dependent substitutions explicitly.

## Refresh stale evidence

The bundled snapshot was captured on 2026-07-23. For work that claims current
or pixel-level parity, inspect the official home and brand pages again. Update
the evidence, tokens, CSS asset, and both skills together if the live system
has materially changed.

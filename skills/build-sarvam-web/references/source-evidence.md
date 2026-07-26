# Source evidence

## Contents

- [Snapshot and method](#snapshot-and-method)
- [Primary official sources](#primary-official-sources)
- [Observed public asset locations](#observed-public-asset-locations)
- [Evidence levels](#evidence-levels)
- [Freshness procedure](#freshness-procedure)

## Snapshot and method

Captured on 2026-07-23 in India Standard Time from Sarvam AI's public website.
The research combined:

- official brand-page statements;
- live desktop and 390 px mobile visual inspection;
- browser-computed styles;
- public CSS custom properties and `@font-face` rules;
- public image, SVG, video, and preload URLs;
- semantic page structure on the home, brand, models, and blog pages.

This is a research snapshot, not an official downloadable brand kit or a grant
of trademark/font usage rights.

## Primary official sources

- [Sarvam home](https://www.sarvam.ai/) — current marketing architecture,
  hero, product demonstrations, proof, CTA, and footer.
- [Sarvam brand](https://www.sarvam.ai/brand) — official vision, gateway idea,
  mandala construction, blue-to-orange system, monogram, and wordmark.
- [Sarvam models](https://www.sarvam.ai/models) — listing, filter, model-card,
  and product taxonomy patterns.
- [Sarvam Edge](https://www.sarvam.ai/products/edge) — product demo, metrics,
  use cases, benchmark, ecosystem, and FAQ patterns.
- [Sarvam Samvaad](https://www.sarvam.ai/products/conversational-agents) —
  demo-first product architecture, outcomes, language support, systems,
  security, deployment, testimonial, and FAQ.
- [Sarvam blog](https://www.sarvam.ai/blogs) — editorial listing and metadata
  patterns.
- [About Sarvam](https://www.sarvam.ai/about-us) — current mission and company
  framing.
- [Current global CSS snapshot](https://www.sarvam.ai/_astro/CookieConsent.Cab5ragO.css)
  — compiled theme, fonts, tokens, utilities, and motion. The hash is volatile.

Treat those pages as authoritative for what Sarvam says about its brand. Treat
computed CSS values as implementation evidence, not permanent brand policy.

Do not use the generated “Website Design” demo embedded in the Sarvam 30B/105B
blog post as a brand source. It is model output, not the live design system.

## Observed public asset locations

These URLs establish provenance and help re-check the live system. Do not
assume that public reachability permits redistribution or production hotlinks.

### Marks and motifs

- Wordmark black:
  `https://assets.sarvam.ai/assets/brand/logos/sarvam-wordmark-black.svg`
  (observed 202 × 32)
- Wordmark white:
  `https://assets.sarvam.ai/assets/brand/logos/sarvam-wordmark-white.svg`
- Monogram black:
  `https://assets.sarvam.ai/assets/brand/logos/sarvam-logo-black.svg`
  (observed 86 × 85)
- Monogram white:
  `https://assets.sarvam.ai/assets/brand/logos/sarvam-logo-white.svg`
- Responsive favicon:
  `https://www.sarvam.ai/favicon.svg`
- Home motif:
  `https://assets.sarvam.ai/assets/motifs/ui/motif.svg`
  (observed 228 × 35)
- Hero gradient:
  `https://assets.sarvam.ai/assets/pages/home/hero-gradient.svg`
  (observed 3244 × 1744)
- White-noise CTA texture:
  `https://assets.sarvam.ai/assets/misc/white-noise.webp`
- Footer masked video:
  `https://www.sarvam.ai/assets/solutions/indian-art-mask.mp4`

### Font endpoints observed in the public page

- `https://www.sarvam.ai/fonts/MatterUprights-VF.woff2`
- `https://www.sarvam.ai/fonts/MatterSemiMonoRegular.woff2`
- `https://www.sarvam.ai/fonts/SeasonMixVFUprights.woff2`

Font metadata identifies Displaay Type Foundry and reserves rights. Record the
names and ranges for fidelity checks. Do not download, commit, redistribute, or
hotlink the binaries without an applicable license.

### Official brand-page imagery

The current brand story uses `brand-img-01` through `brand-img-14` under:

`https://assets.sarvam.ai/assets/brand/images/`

The live delivery service may insert ImageKit-style transformation segments.
Images 01–08 and 11–14 were observed as WebP; 09–10 were observed as PNG. Use
the live brand page to confirm current paths.

## Evidence levels

### Direct official statement

- Vision: AI for all from India.
- Gateway as a shared structural idea and transition between worlds.
- Mandala-inspired construction and repeated-circle monogram.
- Blue-to-orange continuous spectrum.
- Wider, balanced wordmark letterforms.
- Desire to feel rooted without leaning on nostalgia or spectacle.

### Direct implementation observation

- Matter, Matter Semi Mono, and Season Mix font-family declarations.
- Variable font ranges and custom weight mappings.
- Exact CSS color custom properties.
- 640/768/1024/1280/1536 breakpoints.
- 390 px mobile and 1280 px desktop type metrics.
- Pill actions, floating translucent navigation, thin borders, quiet shadows,
  partner marquee, product tabs, code examples, and a tall structured footer.
- Astro with React islands, Tailwind-style compiled CSS, GSAP, ScrollTrigger,
  and a Motion-style interaction runtime.

### Inference and recommended translation

- Which subset of patterns to use for a new product.
- How to replace protected assets in an unofficial prototype.
- Suggested card hierarchy and content mapping.
- Accessibility improvements beyond what can be established from a visual
  inspection.

Label inferences as recommendations when documenting future changes.

## Freshness procedure

Before claiming current or pixel-level parity:

1. Open the official home and brand pages at 1280 × 720 and 390 × 844.
2. Confirm the wordmark, hero composition, fonts, primary colors, navigation,
   and footer have not changed.
3. Inspect current `@font-face` rules and filtered `--color-sr-*`,
   `--color-ct-*`, `--color-sf*`, `--color-tx*`, and `--color-st*` values.
4. Compare the results with `assets/sarvam-theme.tokens.json`.
5. Update this evidence date, token JSON, CSS theme, design references, review
   baseline, and validation scripts in one commit.
6. Note any uncertain or licensed element instead of guessing.

# Sarvam web design tokens

Snapshot: 2026-07-23. Values below were observed from the official public
website's computed styles and CSS custom properties.

## Contents

- [Typography](#typography)
- [Core colors](#core-colors)
- [Extended spectrum](#extended-spectrum)
- [Type scale](#type-scale)
- [Spacing and containers](#spacing-and-containers)
- [Radii, borders, and shadows](#radii-borders-and-shadows)
- [Breakpoints](#breakpoints)
- [Gradient recipes](#gradient-recipes)

## Typography

| Role | Family | Observed source | Range/use |
| --- | --- | --- | --- |
| Display | `Season Mix`, sans-serif | `SeasonMixVFUprights.woff2` | Variable 300–900; normal 425, medium 525 |
| Body/UI | `Matter`, sans-serif | `MatterUprights-VF.woff2` | Variable 100–1000; default 425, medium 525 |
| Metadata | `Matter Semi Mono`, monospace | `MatterSemiMonoRegular.woff2` | Static 400; uppercase technical labels |
| Code | System monospace stack | Browser/system | Small code and SDK snippets |

The live CSS maps Matter weights to 100, 325, 425, 525, 625, 725, 900, and
1000. It maps Season Mix weights to 300, 425, 525, 670, 780, and 900. Preserve
these values instead of rounding every role to generic 400/500/700 weights.

Do not bundle these font files without a license. When authorized, serve them
from the product's own origin and keep the observed `font-display: swap`.

Use language-capable fallbacks after the brand font. Test every Indic script
used by the product; a fallback glyph with correct shaping is better than a
missing-glyph box.

Keep the recorded stacks in `--font-season-mix`, `--font-matter`, and
`--font-matter-mono`. Route the active typography through
`--sarvam-font-display`, `--sarvam-font-body`, and `--sarvam-font-metadata`.
Official mode maps those roles to the recorded stacks. In aligned mode, set
them to explicit licensed substitutes so validation can verify all three roles
without requiring Sarvam's font files.

## Core colors

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#fafafa` | Primary page surface |
| Surface secondary | `#f5f5f5` | Quiet cards and footer gradient |
| Surface tertiary | `#f0f0f0` | Dividers and secondary controls |
| Border | `#e6e6e6` | Thin structural lines |
| Text primary | `#1f1f1f` | Headings and body |
| Text secondary | `#3d3d3d` | Supporting copy |
| Text tertiary | `#666666` | Metadata and subdued copy |
| Text inverse | `#faf8f5` | Copy on deep panels |
| Text brand | `#29211d` | Warm brand copy |
| Text accent | `#c4733d` | Local warm emphasis |
| Stroke | `#e6e6e6` | Primary structural lines |
| Stroke secondary | `#f0f0f0` | Extra-quiet dividers |
| Brand black | `#141414` | High-emphasis near-black |
| Accent indigo | `#3333cc` | Primary accent and active states |
| Deep indigo | `#212191` | Eyebrows and strong indigo text |
| Accent orange | `#e6651b` | Orange anchor of the spectrum |
| Brand orange | `#d5650f` | Deeper campaign orange |
| Positive | `#6ea335` | Success and positive states |
| Danger | `#b81514` | Error and danger states |

Prefer the exact neutrals. Do not replace the warm canvas with a blue-gray SaaS
background.

## Extended spectrum

### Indigo

`50 #fafcff`, `100 #e8effc`, `200 #d2dff9`, `300 #a7c0f1`,
`400 #81a0e9`, `500 #6a88e2`, `600 #556adc`, `700 #4250d5`,
`800 #3333cc`, `900 #212191`, `950 #11115b`.

### Orange

`50 #fffbfa`, `100 #feede6`, `200 #fddcce`, `300 #f9bb9e`,
`400 #f59970`, `500 #f38858`, `600 #ee7944`, `700 #e96c2f`,
`800 #e6651b`, `900 #a5460f`, `950 #682906`.

### Yellow

`50 #fff8e6`, `100 #fff0cf`, `200 #ffe8b7`, `300 #ffcb79`,
`500 #feb12b`, `600 #df9c2a`, `700 #c08827`, `800 #a27224`,
`950 #362813`.

### Green

`50 #f2f8eb`, `100 #e3f1d8`, `200 #c8e4b0`, `300 #acd587`,
`400 #90c85b`, `500 #83c040`, `600 #6ea335`, `700 #496d21`,
`800 #385418`, `1000 #152605`.

### Pink

`50 #fceaf0`, `100 #f9d5e1`, `200 #efabc5`, `400 #d4508e`,
`500 #b12060`, `600 #9d2055`, `700 #871f4b`, `800 #731e3f`,
`950 #4d192c`.

### Red

`50 #fde7e2`, `100 #f8d1c6`, `200 #eba18f`, `300 #db715c`,
`400 #c43d2b`, `500 #b81514`, `600 #a21913`, `700 #781a11`.

### Gray

`50 #f9f9f9`, `100 #f5f5f5`, `200 #f0f0f0`, `300 #e6e6e6`,
`400 #cccccc`, `500 #b3b3b3`, `600 #999999`, `700 #666666`,
`800 #525252`, `950 #292929`.

## Type scale

| Role | Mobile | Desktop | Weight | Notes |
| --- | --- | --- | --- | --- |
| Hero H1 | 44/46.2 | 64/67.2 | 425 | `-0.025em` tracking, centered |
| Section H2 | 30/40.5 | 36/48.6 | 425 | Relaxed editorial line height |
| Product/demo H3 | 20/28 | 28/39.2 | 525 | Season Mix for major demo titles |
| Card title | 18–20/25–28 | 18–22/25–31 | 525 | Matter for repeated card titles |
| Body | 16/24 | 16/24 | 425 | Default reading text |
| Eyebrow | 14/21 | 16/24 | 425 | Indigo, `0.025em` tracking |
| Metadata | 12/18 | 12/18 | 400 | Semi Mono, uppercase |
| Code helper | 11/15.7 | 11/15.7 | 425 | System monospace |

Use `clamp()` only when it resolves to these endpoints at the target
breakpoints. Keep display text to roughly two lines on mobile.

## Spacing and containers

- Use a 4 px base spacing unit.
- Cap the widest site shell at `1400px`.
- Use `1280px` and `1152px` (`72rem`) as common inner caps.
- Use a standard content wrapper near 85% wide on mobile and 75% from 768 px.
- Use 96 px between major mobile sections and 176 px at `768px+`.
- Use 48 px footer top padding on mobile and 80 px on desktop.
- Use 48 px footer group gaps on mobile and 96 px on desktop.
- Keep desktop hero content inside roughly 896 px.
- Use 44–56 px control heights; primary hero actions are 52 px.

## Radii, borders, and shadows

- Use `9999px`/full radius for CTAs, tabs, and compact status chips.
- Use 8 px for small controls.
- Use 12–16 px for inputs and product controls.
- Use 16 px for routine cards on mobile and 24 px at desktop.
- Use 20–32 px for large grouped demonstrations.
- Use 34 px for the desktop floating navigation shell.
- Use 52 px selectively for large campaign or CTA panels.
- Use 1 px borders in `#e6e6e6` or low-alpha near-black.
- Prefer an inset line such as `inset 0 0 0 1px rgba(30,32,51,.14)`.
- Use shadows sparingly: `0 1px 3px rgba(0,0,0,.06)` is sufficient for
  small elevated surfaces.

## Breakpoints

The public site exposes these primary min-width breakpoints:

- `40rem` / 640 px
- `48rem` / 768 px
- `64rem` / 1024 px
- `80rem` / 1280 px
- `96rem` / 1536 px

Collapse the full navigation below 1024 px. Treat 390 px as the required phone
baseline, not 375 px plus accidental overflow.

## Gradient recipes

### Primary dark button

`linear-gradient(180deg, #3a3f5c 0%, #1e2033 100%)`

### Secondary light button

`linear-gradient(180deg, #ffffff 0%, #f0f1f5 100%)`

### Indigo atmosphere

Use a blurred radial layer:

`radial-gradient(circle, #a5bbfc 0%, #d5e2ff 40%, transparent 70%)`

Set desktop size near `600 × 400`, opacity `.4`, and blur near `100px`.
Reduce to `288 × 288`, opacity `.3`, and blur `80px` on mobile.

### Hero spectrum

The official hero asset uses a large radial field with tightly grouped outer
stops: `#f9730c` at 75%, `#ffb053` at 78%, `#a5bbfc` at 80%, and
`#f4f7ff` at 100%. Crop the field from above, then fade it into the canvas with
white and transparent overlays. The bundled CSS preserves these recorded stops
but uses original geometry as an implementation approximation. Use the official
SVG only when authorized.

### Hairline glow

`radial-gradient(circle, #6a88e2 0%, transparent 100%)` on a 1 px line.

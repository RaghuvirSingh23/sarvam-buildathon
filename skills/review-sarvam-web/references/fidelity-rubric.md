# Sarvam web fidelity rubric

## Contents

- [Scoring](#scoring)
- [Severity](#severity)
- [Category checks](#category-checks)
- [Confidence](#confidence)

## Scoring

Score each category independently, then sum:

| Category | Points |
| --- | ---: |
| Brand logic and content voice | 10 |
| Typography | 20 |
| Color and gradient behavior | 15 |
| Layout and spacing | 15 |
| Components and interaction states | 10 |
| Motion | 10 |
| Responsive behavior | 10 |
| Accessibility and language quality | 10 |
| **Total** | **100** |

Interpretation:

- `90–100`: high fidelity and demo-ready;
- `80–89`: recognizably Sarvam-aligned with limited drift;
- `70–79`: directionally aligned but visibly inconsistent;
- `50–69`: partial token match on a generic structure;
- `<50`: not recognizably aligned.

Cap the score at 79 when exact fonts are required but unavailable. Cap at 69
when the core flow is unusable with keyboard or at 390 px.

## Severity

- **Blocker:** Prevents use, misrepresents authorization, or fails a core
  accessibility/responsive requirement.
- **Major:** Creates obvious brand drift in a primary section or repeated
  component.
- **Minor:** Local inconsistency that does not undermine the overall system.

## Category checks

### Brand logic and content voice — 10

- Communicates an outcome with concise, assured copy.
- Feels inclusive, modern, and technically serious.
- Uses Indian context authentically rather than ornamentally.
- Does not copy unsupported claims, proof, or customer identities.

### Typography — 20

- Uses or transparently substitutes all three typography roles.
- Matches the 44/64 hero endpoints and editorial line height.
- Uses Matter-like body proportions at 16/24.
- Uses semi-mono uppercase labels sparingly and consistently.
- Shapes every displayed Indic script correctly.

### Color and gradients — 15

- Uses exact core neutrals and accents.
- Creates a continuous orange-to-indigo atmosphere.
- Keeps large surfaces quiet and warm.
- Maintains text and component contrast across gradient extremes.
- Avoids generic neon or oversaturated startup gradients.

### Layout and spacing — 15

- Uses a 4 px rhythm, 1400 px shell, and strong vertical breathing room.
- Alternates editorial, interactive, and proof sections.
- Uses a centered decisive hero rather than a generic split layout by default.
- Maintains coherent hierarchy and reading widths.

### Components and interaction — 10

- Uses paired pill actions with correct primary/secondary treatment.
- Uses thin borders, subtle inset lines, and restrained shadows.
- Gives product demos, tabs, cards, forms, and code distinct roles.
- Shows hover, active, focus, disabled, loading, and error states.

### Motion — 10

- Uses restrained routine transitions and one-shot content entrances.
- Connects motion to flow, status, or hierarchy.
- Keeps content stable and animation performant.
- Provides a static reduced-motion alternative.

### Responsive behavior — 10

- Has no horizontal body overflow at 390 px.
- Uses a compact mobile header and collapses full nav below 1024 px.
- Keeps headline, CTAs, tabs, cards, and footer readable.
- Preserves a logical DOM and visual order at every breakpoint.

### Accessibility and language — 10

- Uses semantic elements and visible focus.
- Meets WCAG 2.2 AA contrast for product UI.
- Maintains 44 px targets and zoom support.
- Provides media alternatives and useful alt text.
- Handles long translations, language metadata, and mixed scripts.

## Confidence

Report confidence as:

- **High:** All required routes and interaction states were rendered at four
  viewports, fonts/assets were verified, and automated checks ran.
- **Medium:** Primary routes and two viewports were rendered, but some states or
  licensing details were unavailable.
- **Low:** Review relied mainly on source, static screenshots, or incomplete
  access.

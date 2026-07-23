# Sarvam web components and layout

## Contents

- [Page rhythm](#page-rhythm)
- [Announcement strip](#announcement-strip)
- [Floating navigation](#floating-navigation)
- [Hero](#hero)
- [Buttons and links](#buttons-and-links)
- [Product demonstrations](#product-demonstrations)
- [Cards and proof](#cards-and-proof)
- [Forms and code](#forms-and-code)
- [Footer](#footer)
- [Responsive composition](#responsive-composition)

## Page rhythm

Compose long pages as alternating modes rather than a stack of identical cards:

1. centered editorial hero;
2. partner or proof marquee;
3. interactive product demonstration;
4. API or implementation section;
5. mission or outcome-led panel;
6. product/system architecture;
7. customer evidence;
8. enterprise or deployment detail;
9. research/updates;
10. cinematic closing CTA;
11. structured footer.

Use only the sections the product needs. Preserve the alternation between quiet
editorial space, interactive detail, and evidence.

## Announcement strip

- Use a 32 px tall strip above the main header.
- Center a short event or release message with one underlined action.
- Use a warm neutral background near `#f5f5f3`.
- Add a restrained geometric pattern at the outer edges if it remains legible.
- Keep it single-line and horizontally safe on mobile. Do not allow the action
  to clip at 390 px.

## Floating navigation

Desktop:

- Fix the header at the viewport top with a high stacking level.
- Offset the capsule 32 px from each side and place it below the ticker.
- Use a roughly 70 px shell with a 34 px radius.
- Use white at about 55% opacity with 24 px backdrop blur, slight saturation,
  and a very light inset border.
- Place the wordmark left, short uppercase navigation groups center, and two
  actions right.
- Use Matter for navigation and Season Mix for action labels.

Mobile:

- Use an 8 px horizontal gutter.
- Show the wordmark and a single menu control in a compact capsule.
- Hide the desktop navigation at widths below 1024 px.
- Expand a full menu with clear focus management and scroll locking.

Do not copy Sarvam's exact navigation categories when the product has different
content.

## Hero

Build the hero in this order:

1. abstract motif or monogram area;
2. indigo eyebrow between two faint glowing hairlines;
3. display headline;
4. one or two short supporting lines;
5. primary and secondary CTA pair;
6. proof label and marquee.

Desktop guidance:

- Start content around 160 px from the top.
- Keep the minimum height near the viewport and cap large compositions at
  1080 px.
- Keep the headline near 64 px and the content centered.
- Use a wide atmospheric gradient cropped from above.
- Leave substantial negative space before the proof row.

Mobile guidance:

- Start content around 144 px from the top.
- Use a two-line 44 px headline.
- Constrain copy to about 320 px.
- Keep the CTA pair on one row only if both labels remain comfortable.
- Reduce decorative saturation and let the canvas dominate.

## Buttons and links

Primary CTA:

- Use the dark indigo gradient.
- Set height to 48–52 px, padding to about `14px 24px`, and full radius.
- Use Season Mix at 16–18 px and an observed variable weight near 525.
- Add a soft 80 px radial highlight on hover. For pointer-following behavior,
  update `--sarvam-pointer-x` and `--sarvam-pointer-y` on pointer movement; the
  starter CSS intentionally falls back to the center without JavaScript.
- Scale to `.97` during active press.
- Use a 350 ms `cubic-bezier(.2, 0, 0, 1)` transition.

Secondary CTA:

- Use the white-to-cool-gray gradient.
- Add `inset 0 0 0 1px rgba(30,32,51,.14)`.
- Keep the same dimensions as the paired primary action.

Tabs and filter chips:

- Use Matter at 14–15 px.
- Use a full radius and at least 42 px height.
- Use pale indigo for selected states and retain a visible focus ring.

Text links:

- Underline explicit utility links such as event registration.
- Use directional icons consistently for navigational links.
- Do not hide all links behind animation-only affordances.

## Product demonstrations

Make product capability tangible. Prefer one interactive demonstration over
several abstract feature cards.

Use:

- a horizontal product tab list;
- a large grouped card with 24 px mobile and 32–48 px desktop radius;
- a clear active state;
- realistic, non-sensitive example content;
- compact metadata in Matter Semi Mono;
- controls with 44 px targets;
- color-coded model or media actions from the extended spectrum;
- an obvious path from demo to API or signup.

On mobile, make tab rows horizontally scrollable with edge fades. Keep the
active item visible and preserve keyboard access.

## Cards and proof

Use card groups for:

- product/API families;
- deployment options;
- case studies;
- research updates;
- trust and governance detail.

Vary card size according to importance. Avoid a uniform three-column feature
grid for every section.

Use:

- quiet white or near-white surfaces;
- 1 px borders;
- 16–32 px radius;
- restrained shadows;
- large readable titles;
- short evidence-led descriptions;
- one clear click target per card.

Use `0 6px 32px rgba(0,0,0,.07)` for a case-study hover and
`0 8px 30px rgba(0,0,0,.06)` for a research-card hover. Keep image zoom near
1.05 over 500 ms.

Display external customer logos only with permission. When present, convert
them to a consistent monochrome treatment and keep the original aspect ratios.

## Forms and code

For text or speech demos:

- use 12–16 px inner control radii;
- use 16 px body text, increasing to 24 px only for large creative input;
- keep language and mode controls close to the field they affect;
- show length, state, or latency metadata without overwhelming the user;
- use clear disabled and loading states.

For code:

- provide language tabs;
- show a visible copy control;
- use a system monospace stack;
- keep code contrast high;
- pair the snippet with a direct API-key or documentation action;
- never place real credentials in an example.

## Footer

Use a white-to-`#f5f5f5` vertical gradient and a 1 px top border.

Organize:

- brand and vision;
- social destinations;
- physical/legal identity when required;
- grouped product/API/resource/company/legal links;
- event callout if current.

Use 12 px uppercase Matter Semi Mono for group titles and Matter for links.
Allow a tall, spacious footer at desktop. Reflow to stacked groups on mobile
without shrinking touch targets. If authorized, a quiet masked-media treatment
may use the wordmark on desktop and monogram on mobile.

## Responsive composition

Validate at:

- 390 × 844 for the phone baseline;
- 768 × 1024 for tablet transition;
- 1024 × 768 for navigation and grid changes;
- 1280 × 720 for the observed desktop composition;
- 1440 × 900 for the 1400 px maximum shell.

Check:

- no horizontal body overflow;
- announcement text does not clip;
- display headings do not produce orphan words;
- CTA labels remain inside their pills;
- horizontal tabs expose their scrollability;
- cards retain a coherent reading order;
- sticky/fixed elements do not cover headings or form controls;
- the footer remains navigable without tiny columns.

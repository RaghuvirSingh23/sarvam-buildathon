# Sarvam motion and accessibility

## Motion language

Use motion to express transition, flow, and changing state. Keep primary content
stable while atmospheric layers, motifs, and state indicators move subtly.

Observed timing families:

- 150–200 ms for compact component feedback;
- 300–400 ms for menus, backdrop changes, and larger reveals;
- 600 ms for individual card entrances;
- 800 ms for section reveals from `translateY(24px)`;
- 1 s for scale-and-rise reveals from `.96` and `translateY(20px)`;
- 120 ms for child stagger;
- 20–60 s linear loops for announcement or logo marquees.

Use `cubic-bezier(.25, 1, .5, 1)` for large content reveals,
`cubic-bezier(.2, 0, 0, 1)` for polished component motion, and the standard
`cubic-bezier(.4, 0, .2, 1)` for routine UI transitions.

Trigger one-shot section reveals near a 10% lower-viewport margin. Reveal
immediately when IntersectionObserver is unavailable or reduced motion is set.

## Interaction details

- Scale pressable pills to `.97` on active.
- Fade a soft radial highlight in on primary-button hover.
- Use opacity and transform for performant reveals.
- Keep card hover lift to about 4 px.
- Keep hover-only effects additive; do not hide required information until
  hover.
- Pause user-controlled media and provide clear play state.
- Keep decorative video muted and nonessential to comprehension.
- Avoid parallax or large blur movement behind long reading passages.

## Reduced motion

Provide a `prefers-reduced-motion: reduce` branch that:

- reduces animation duration to near-zero;
- disables autoplay-like decorative motion;
- stops marquees and exposes the items in a static, wrap-capable layout;
- removes parallax and large transform changes;
- preserves state visibility without depending on animation.

Do not remove focus transitions or loading status. Replace motion with a clear
static state.

## Keyboard and focus

- Keep the DOM reading order aligned with the visual order.
- Use semantic links, buttons, tabs, tab panels, lists, headings, and forms.
- Implement roving focus or standard keyboard behavior for tab lists.
- Keep visible `:focus-visible` rings against both light and gradient surfaces.
- Restore focus when closing the mobile menu or modal.
- Provide a skip link before the fixed header.
- Ensure fixed navigation does not obscure focused elements.

## Contrast and text

- Test every gradient area at its lightest and darkest points.
- Keep primary text near `#1f1f1f` on light surfaces.
- Use deep indigo `#212191` for small accent text, not a low-contrast mid-blue.
- Do not use tertiary gray for essential instructions.
- Keep body text at 16 px with 24 px line height.
- Provide real text rather than text baked into brand imagery.

Target WCAG 2.2 AA for product interfaces. Treat 4.5:1 as the normal-text
minimum and 3:1 as the large-text and component-boundary minimum.

## Touch and responsive access

- Keep interactive targets at least 44 × 44 px.
- Leave spacing between adjacent mobile controls.
- Make horizontally scrolling tabs keyboard accessible and visibly scrollable.
- Never disable pinch zoom.
- Respect safe-area insets on full-screen mobile menus and bottom actions.
- Test at 200% browser zoom and with long translated labels.

## Images and media

- Write meaningful alt text for informative brand and product images.
- Use empty alt text for purely decorative motifs.
- Add captions or transcripts for audio/video that conveys product information.
- Avoid animating a logo merely to attract attention.
- Lazy-load below-the-fold media and reserve intrinsic dimensions to prevent
  layout shift.
- Use responsive 640/1024/1600 px image candidates where appropriate.

## Language quality

- Declare the page language and mark inline language changes.
- Use fonts and shaping engines that cover every displayed Indic script.
- Test line breaks, punctuation, numerals, and mixed-script content.
- Do not force uppercase on scripts where casing is not meaningful.
- Keep translated controls flexible instead of hard-coding narrow widths.

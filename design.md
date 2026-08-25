---
name: Clinical Elite
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5c3f3f'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#916f6e'
  outline-variant: '#e5bdbb'
  surface-tint: '#bf0029'
  primary: '#bc0028'
  on-primary: '#ffffff'
  primary-container: '#e2263c'
  on-primary-container: '#fffdff'
  inverse-primary: '#ffb3b1'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#006869'
  on-tertiary: '#ffffff'
  tertiary-container: '#008384'
  on-tertiary-container: '#fafffe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001d'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#91f2f3'
  tertiary-fixed-dim: '#74d6d6'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#004f50'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style
The design system is rooted in a premium, medical-grade aesthetic that prioritizes clarity, authority, and precision. It blends a high-end consumer hardware feel with the rigorous demands of clinical software. 

The style is **Modern Corporate** with strong **Minimalist** influences. It utilizes a pure white canvas to emphasize cleanliness, punctuated by a singular, high-energy brand color that signals urgency and action. The emotional response should be one of absolute reliability, sophistication, and effortless efficiency. High contrast and generous whitespace are the primary drivers of the visual hierarchy, ensuring that critical medical data remains the focal point.

## Colors
This palette is disciplined and intentional. The background is strictly pure white (#FFFFFF) to maintain a sterile, high-end environment. 

- **Primary (Medical Red):** Reserved for primary actions, critical alerts, and brand signifiers. It is high-chroma to ensure visibility against white.
- **Secondary (Obsidian):** Used for primary text and iconography to ensure AAA accessibility and a "printed" feel.
- **Neutral (Soft Gray):** Used exclusively for large background sections, subtle containers, and hairline dividers to provide depth without adding visual noise.

## Typography
The typography system uses **Inter** exclusively to achieve a systematic, utilitarian, yet modern look. 

- **Discipline:** Use `700` weight sparingly for displays; `600` is the standard for headlines to maintain a refined profile.
- **Readability:** Body text uses a slightly increased line-height (1.5x) to ensure legibility during long clinical reviews.
- **Hierarchy:** Labels use medium weights and subtle letter-spacing to differentiate metadata from primary content.
- **Scaling:** On mobile, large display type should scale down significantly to avoid awkward line breaks, maintaining a maximum headline size of 24px.

## Layout & Spacing
This design system employs a **Fixed Grid** philosophy for desktop to maintain the "editorial" premium feel, while transitioning to a fluid model for mobile.

- **Grid:** A 12-column grid with 24px gutters. Content is centered in a 1280px max-width container.
- **Rhythm:** An 8px linear scale governs all padding and margins.
- **Whitespace:** Use generous vertical spacing (Section Gaps) to separate distinct clinical modules, preventing cognitive overload.
- **Mobile:** Margins shrink to 20px, and complex multi-column layouts must reflow into a single-column vertical stack.

## Elevation & Depth
Depth is created through a combination of tonal layering and highly specific shadows. 

- **Base Layer:** Pure #FFFFFF.
- **Section Layer:** #F5F5F5 used for background areas that contain multiple cards or data tables.
- **The "Clinical" Shadow (Neutral):** Applied to primary cards and containers. It uses a complex stack: an inner 2px inset for "etched" definition, combined with a soft, multi-layered drop shadow to create a floating effect without looking heavy.
- **The "Action" Shadow (Brand):** Applied exclusively to primary red buttons. It uses a tinted glow (#E2263C at 39% opacity) to make the button appear energized and interactive.

## Shapes
The shape language is **Rounded**, reflecting the approachable yet precise nature of modern medical technology.

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Content blocks and major sections use 1rem (16px) to soften the overall layout.
- **Interactive Elements:** Checkboxes maintain a small 4px radius, while tags/chips may use the "Pill" style (100px) to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons use the Brand Color with the Brand Shadow. Text is white, bold, and centered. Secondary buttons use a #111111 stroke with no fill.
- **Cards:** Must use the Neutral Shadow stack against a #FFFFFF background. Padding should be at least 32px to maintain the premium feel.
- **Inputs:** Clean, 1px #E5E5E5 border that transitions to #111111 on focus. Labels sit strictly above the field in `label-md`.
- **Status Chips:** Use high-contrast backgrounds (e.g., light red tint with dark red text) but keep the shapes consistent with the 8px roundedness.
- **Data Tables:** Remove all vertical borders. Use 1px #F5F5F5 horizontal dividers only. Header text should be `label-sm` in Obsidian (#111111).
- **Navigation:** A minimal top bar with a height of 72px, utilizing a subtle #F5F5F5 bottom border rather than a shadow to keep the top of the interface feeling light.

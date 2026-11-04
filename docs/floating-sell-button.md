# Desktop floating Sell button

The homepage now has a teal circular plus link fixed 56px above the viewport bottom and 40–88px from its right edge depending on viewport width (with safe-area protection), using a 64px target. Hover or keyboard focus shows the existing localized Sell an Item label (Uzbek: E’lon berish). Clicking opens the full existing /sell form directly, following the user's clarification rather than adding an intermediate popup. Existing authentication and country onboarding guards remain in that route.

`src/features/marketplace/floating-sell-button.tsx` owns the link and tooltip dismissal, with styles in its adjacent CSS file. Escape dismisses the tooltip while hovered or keyboard-focused; re-entering/focusing restores it. The label is accessible through aria-label. A transparent bridge keeps the tooltip hoverable. Reduced motion removes transitions.

The control is shown above 700px only; existing mobile sell navigation is retained. It does not modify other pages, categories, forms or backend behavior, and needs no SQL or dependencies.

Validation: ESLint, TypeScript and production build pass. Playwright with disposable local fixture data verified the 64px button at the same viewport coordinates before/after scrolling, hover text, keyboard focus, Escape dismissal/restoration, mobile hiding, and navigation through the button to the complete signed-in sell form. Desktop screenshots were visually inspected against the approved circular-plus concept.

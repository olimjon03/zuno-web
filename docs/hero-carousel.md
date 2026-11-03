# Animated marketplace hero

The homepage hero now pairs four educational messages with matching photography: discovering local finds, posting an item with up to ten photos, messaging/meeting safely, and saving listings with bookmarks. The existing Sell an Item and Explore nearby links remain in a fixed position.

`src/features/marketplace/hero-carousel.tsx` owns its state and timer, so rotating slides does not rerender or refetch marketplace results. Slide data is in `hero-slides.ts`; styles are scoped in `hero-carousel.css`. Text and image crossfade together, with a small upward text reveal and a subtle image scale transition. Grid layers reserve the tallest text content so switching slides does not shift the rest of the page.

Rotation advances every 5,000 ms while visible and idle. Hover, keyboard focus, an offscreen hero, or a hidden browser tab suspends it; resuming starts a fresh five-second interval. Previous/next and four selector buttons work manually and wrap around. There is **no pause button**, as requested. Reduced-motion preference disables automatic rotation and transition effects; manual controls still work. Inactive content is hidden from assistive technology; automatic changes are not announced, while user-initiated selections have a localized live announcement.

All new interface copy and image alternatives are translated into Uzbek, Korean, Russian and Vietnamese, following the existing country language menus. The first image is preloaded; other images use lazy loading and responsive Next Image sizing. No packages, configuration changes, backend endpoints, or SQL migrations are needed.

Validation: lint, TypeScript and production build pass; all 68 existing Node tests pass, including full dictionary/placeholder checks. Playwright with disposable fixture data verifies five-second advance, paired photo/text changes, manual navigation/wrap, hover/keyboard/offscreen/reduced-motion behavior, stable hero height and no page overflow at 320/390/768/1440px. Browser renderings were visually compared with the design concept, with the pause control removed per the user's correction.

## Generated assets

Built-in image generation was used; source assets were optimized locally to 1200px-wide WebP without replacing the existing first-slide image. Project-bound outputs:

- `public/images/hero-selling.webp`
- `public/images/hero-meeting.webp`
- `public/images/hero-saved.webp`

Final prompt set:

1. Photorealistic editorial lifestyle image for a second-hand marketplace: hands using a smartphone to photograph a gently used silver/black camera on a light wooden table, cream lamp and plant in soft warm daylight, subtle mint details, centered for mobile crops, accurate hands, no text, logos or watermark.
2. Photorealistic editorial neighborhood exchange at a public cafe: two adults' torsos and hands inspecting a gently used silver/black camera, phone face down and two coffees on the table, soft warm daylight, subtle mint details, no faces, cash, addresses, logos or text, centered for mobile crops.
3. Photorealistic editorial still life of gently used cream headphones, a silver/black camera, two unbranded books and a small plant on pale oak, mint wall and warm window light, centered for mobile crops, no text, logos, symbols or watermark.

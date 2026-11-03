# Animated marketplace hero

The homepage has 15 educational slides: local discoveries, selling, meeting neighbors, bookmarks, search, area selection, ten listing photos, item condition, budgets, local currency, reservations, listing management, message attachments, profiles, and safe exchanges. Copy is translated into Uzbek, Korean, Russian and Vietnamese alongside English.

`hero-slides.ts` owns content and the 8,000 ms interval. `hero-carousel.tsx` owns isolated state, visibility and controls; marketplace results are not refetched when slides change. Scoped CSS coordinates directional image crossfades, blur/scale reveals and staggered text movement. Grid layers reserve text height. Scrollable selectors follow the active slide, including after resizing. Previous/next buttons wrap around. There is no pause button.

Hover, keyboard focus, an offscreen hero and hidden tabs suspend rotation and video playback. Resuming starts a fresh eight-second interval. Reduced motion disables autoplay and transitions; manual controls remain available. Automatic changes are not announced; manual selections receive a localized announcement.

`hero-media.tsx` supports optional local video sources with image posters. Three silent eight-second H.264 MP4s are motion montages made from ZUNO-generated product photographs, with pans, zooms and crossfades; they are not filmed footage. Clips are 960×540 at 24 fps, around 1.3 MB each, with fast-start metadata. Only current/previous videos mount, only the active video plays, and reactivating a slide restarts its clip. Videos use muted inline playback and preload none. Blocked autoplay or playback errors preserve the poster; reduced motion and Save Data use posters without video elements.

The first image is preloaded. Other posters mount only for current, previous and next slides and use responsive Next Image sizing. No dependencies, Next configuration changes, backend endpoints or SQL migrations are needed.

Video assets: `public/videos/hero-selling.mp4`, `hero-neighborhood.mp4`, and `hero-finds.mp4`. The optional macOS asset utility `scripts/render-hero-video.swift` reproduces these from generated source PNGs using AVFoundation; it is not part of application builds. Compile with `swiftc scripts/render-hero-video.swift -o /tmp/render-hero-video`, then pass output path and two or more image paths.

Validation: 70 Node tests cover translations, unique slide IDs, local assets and complete fast-start MP4 containers. Lint, TypeScript and production build are checked. Browser QA covers all 15 slides, eight-second timing, wraparound, mobile/desktop layouts, video metadata/playback, hover suspension, reduced motion, Save Data, blocked autoplay fallback and HTTP range requests.

## Generated assets

Built-in image generation was used; source assets were optimized locally to 1200px-wide WebP without replacing the existing first-slide image. Project-bound outputs:

- `public/images/hero-selling.webp`
- `public/images/hero-meeting.webp`
- `public/images/hero-saved.webp`

Final prompt set:

1. Photorealistic editorial lifestyle image for a second-hand marketplace: hands using a smartphone to photograph a gently used silver/black camera on a light wooden table, cream lamp and plant in soft warm daylight, subtle mint details, centered for mobile crops, accurate hands, no text, logos or watermark.
2. Photorealistic editorial neighborhood exchange at a public cafe: two adults' torsos and hands inspecting a gently used silver/black camera, phone face down and two coffees on the table, soft warm daylight, subtle mint details, no faces, cash, addresses, logos or text, centered for mobile crops.
3. Photorealistic editorial still life of gently used cream headphones, a silver/black camera, two unbranded books and a small plant on pale oak, mint wall and warm window light, centered for mobile crops, no text, logos, symbols or watermark.


Additional generated posters:

- `public/images/hero-workspace.webp`: photorealistic editorial second-hand workspace on pale oak with laptop, headphones, books and plants, warm natural daylight and mint accents, centered mobile-safe composition, no text or branding.
- `public/images/hero-wardrobe.webp`: photorealistic gently used folded neutral sweaters, denim and cream sneakers beside a chair, soft daylight, mint/cream palette, centered mobile-safe composition, no text or branding.
- `public/images/hero-bicycle.webp`: photorealistic cream bicycle outside a public neighborhood cafe with mint door and plants, warm daylight, centered mobile-safe composition, no text or branding.

All generated posters are optimized to 1200px-wide WebP. Original generated PNGs are retained outside the repository.

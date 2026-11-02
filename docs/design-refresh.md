# ZUNO design refresh

The account dashboard uses charcoal (#111314), card surfaces (#1C1F22), borders (#303437), ivory (#F7F6F2), orange (#FF7A00), and cream (#FFF3E6). Marketplace surfaces remain white with a cream hero. Geist is retained. Cards use 14px radii, 12–24px gaps, outlined currentColor SVG icons, and explicit focus outlines. The account sidebar collapses into a five-destination mobile dock. No additional dependencies or database migrations.

## Source concepts

Generated concepts are design references, not shipped screenshots:

- Account desktop: `/Users/tojiboevolimjon/.codex/generated_images/01a19b1b-a4ae-7ea2-8aa4-f1f3204bd684/exec-d47c52f3-6d91-4ef9-a9e8-0651dfd38bd6.png`
- Account mobile: same directory, `exec-0508c7a7-11ad-421d-af9d-4e60df483620.png`
- Explore menus: same directory, `exec-42a27d07-b429-4911-91db-64e8af08c6bd.png`
- Marketplace: same directory, `exec-ddf11125-8b1c-445d-98c9-19066117faae.png`
- Standalone generated hero photograph: same directory, `exec-6cecb09c-8239-4a56-9e01-7e704b79d89e.png`; optimized production asset `public/images/hero-v2.webp`.

Prompts specified an original ZUNO account workspace with profile, three working shortcuts, orange selling panel, neighborhood panel, and help links. A separate concept added six groups and eighteen planned menus following the user's request. Marketplace prompt specified white header, cream split hero with warm chair/camera photograph, category rail, four-column listings, and quiet footer. No fabricated wallet balances, trust scores, or activity statistics.

## Verification and fidelity ledger

Browser/IAB automation was unavailable. Used Playwright Chromium with a disposable local Auth/REST fixture; no real user data was modified. Captured account desktop at 1435×1096 (native reference dimensions), marketplace desktop at 1346×1169, account mobile at 390×1080, and marketplace mobile at 390×844. The high-resolution mobile concept was interpreted at logical mobile width. Both concepts and final browser screenshots were inspected with view_image.

| Point | Reference and render evidence | Resolution |
| --- | --- | --- |
| Copy | My ZUNO, Your neighborhood your little corner, Make room for something new, Sell an Item, and Explore ZUNO | Preserved; actual profile and neighborhood replace concept placeholders. Above-fold static headline/CTA copy matches. Search retains existing wording. |
| Layout | Sidebar, profile, three shortcuts, orange/charcoal split, six menu groups | Implemented. User-requested Explore section extends the shorter top concept before Help & more. |
| Palette | Orange/cream marketplace and charcoal account | Tokens preserved; corrected profile button contrast against dark cards. |
| Typography | Strong compact headings and muted descriptive text | Geist retained; fixed unweighted group headings after visual comparison. Practical UI text sizing differs from generated raster typography. |
| Icons | Consistent outlined SVG navigation and feature metaphors | Extended repository icon system, added item-specific icons; reused house/settings metaphors for related features. |
| Assets | Warm chair, plant, camera, lamp hero | Generated standalone asset, optimized as WebP; actual listing photos remain user-owned. Fixture listing has no photo and deliberately uses existing fallback. |
| Spacing/responsiveness | Desktop split and mobile stacked cards | No horizontal overflow at 390px; fixed inherited hero padding and CTA margins. Mobile category rail scrolls, dock respects safe area. |

Intentional differences: live listing count/photos and profile content are data-driven; no fabricated eight-item feed replaces a real listing. Settings icon opens a real page instead of a decorative account dropdown. Existing form styling is retained on settings. Hero excludes decorative box artwork from the account concept. Mobile dashboard includes the eighteen new menus, making it longer than the initial mobile concept. These differences preserve usable functionality and the user's expanded scope; the result is visually verified against the concept direction, not a pixel-identical copy.

Verified: private account login, all eighteen menu rows, feature search filtering to one result, preview dialog opening and Escape closing, Edit profile navigation, listing search empty state and Clear filters, generated hero loading, and responsive overflow. Lint, production build, and all fifteen existing validation/realtime tests passed. Existing harmless Node module-type warnings remain in the test runner. Planned menu descriptions are previews; they do not save preferences, send notifications, process payments, or claim services are active.

## Files

- Account route: authenticated dashboard; `/account/settings` preserves profile editing.
- `features/account/explore-menu.tsx`: searchable future-feature registry and accessible dialog.
- `components/layout/mobile-nav.tsx`, header, root layout: responsive navigation, existing unread provider integration.
- Marketplace homepage and category navigation: new hero/layout and category icons.
- Icon component and global CSS: shared visual system; profile action also revalidates settings.
- `/help`: working FAQ and About destination.

## Selected identity: Teal Local Pin (2026-11-02)

This supersedes the orange palette above. User selected Local Pin logo option 02 and teal direction 01, then requested implementation with Saved replacing Browse.

Reference: `/Users/tojiboevolimjon/.codex/generated_images/01a19b1b-a4ae-7ea2-8aa4-f1f3204bd684/exec-e8f5efa1-8d5b-4719-8afb-77306b1aa51a.png` (1536×1024). Brand teal #0D9488; mint #F0FDFA; charcoal #1F2328. Interactive teal #0F766E supports accessible small white labels. Shared vector Local Pin/Z component and app/favicon assets replace text-only wordmarks across account, auth, listings, selling, chats, help, and homepage.

Fidelity review compared reference and Playwright screenshots using view_image: (1) charcoal wordmark with teal pin, (2) mint split marketplace hero with teal headline, (3) charcoal account and teal selling panel, (4) Saved/Messages/Sell navigation, (5) mint shortcut icon surfaces, (6) responsive stacked hero and mobile dock. Checked desktop at reference-native 1536×1024 and mobile at 390×844. Browser automation is unavailable; used Playwright Chromium fallback. Verified menu search and preview dialog/Escape, real auth fixture, Saved header destination, logo computed RGB(13,148,136), and no mobile horizontal overflow.

Intentional deviations: preserve existing eighteen future menus and sidebar rather than deleting user-requested content; preserve Korean locations, KRW and live data, not the concept's invented Seattle identity, dollar listings or activity counts. Keep existing generated chair/camera photograph and Geist typography. Above-fold copy uses existing approved Good finds / Great neighbors, tagline, Sell an Item and Explore nearby; only requested Browse→Saved navigation change is introduced. Small vector refinements make the selected pin scalable rather than embedding a generated raster screenshot as UI. No new database migration, dependencies or Next configuration changes.

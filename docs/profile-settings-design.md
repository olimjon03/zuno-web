# Profile settings — Soft layout on white

User selected option 06 Soft with the white background from option 01 Clean. Reference board: `/Users/tojiboevolimjon/.codex/generated_images/01a19b1b-a4ae-7ea2-8aa4-f1f3204bd684/exec-c05e34e5-38aa-4949-8b98-bd1b880370ee.png`.

Design tokens: white page; mint #E1F7F3 avatar; charcoal text; #0F766E accessible teal controls; 24px white information card with subtle border/shadow; centered profile, title and photo disclosure. Existing Geist and outlined icon system retained. Back and Home are separate accessible icon controls.

The settings page removes duplicate Saved, Listings, Messages and sidebar/dock navigation. ProfileForm starts in view mode. Edit exposes name and neighborhood fields; Save returns to view mode only after success. Failed saves retain input and editing state; Cancel restores the last saved values. Email remains read-only. Change photo expands the existing upload form. The neighborhood deep link still opens edit mode.

Validation: Playwright Chromium fallback (Browser/IAB automation unavailable), disposable local auth/data fixture, mobile 390×844 and desktop 1440×1000. Compared concept and final screenshots using view_image. Verified failure/retry, successful save, cancel, real history Back, Home, no duplicate menus, white computed RGB(255,255,255), and no overflow. Lint/build pass; existing 15 tests also passed during this settings task.

Fidelity review: centered avatar/name and section hierarchy match 06; white replaces mint background by explicit user choice; rounded information card and teal edit action match; icons use the existing user/mail/pin SVG style; copy keeps Profile settings, View public profile, Change photo, Edit profile and Log out. Data is real/fixture-driven rather than concept placeholder text. Decorative row chevrons are omitted because individual rows are not links. Existing Local Pin wordmark is retained. The short explanatory subtitle is retained from 01. Reference is a three-option board, so native board dimensions are not a single-screen target; mobile and desktop widths were tested independently. No backend or migration changes in this task.

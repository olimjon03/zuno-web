# Compact homepage and Explore ZUNO

The homepage keeps its full content width and reduces the hero's height. The existing 15 stories, eight-second interval, imagery, MP4 clips, links and motion preferences remain. Desktop retains the descriptions; on mobile the headline, tagline, actions and media stay visible while detailed descriptions remain available to screen readers. All controls remain available. Headings reserve space across slides to avoid shifting the feed.

Category pills and price/sort controls are smaller. Mobile has a filter disclosure, sort selection and availability toggle on one row, with the two price fields and reset below. Collapsing the price row keeps entered values. Price validation, country currency, URL updates, search, categories and reset use the existing feed logic.

`ExploreLauncher` places the desktop app-grid button immediately to the left of the homepage ZUNO logo, with its panel aligned to that side. The homepage account link uses a circular silhouette icon with localized accessible labels instead of visible account text. Login/account destinations and the unread badge are preserved. Its native modal dialog reuses the unmodified `ExploreMenu`: all six groups, eighteen feature rows, names, descriptions, search, planned-feature dialogs and language preferences remain. Desktop account also has the launcher; mobile keeps Explore in its original account position. Close, Escape, backdrop click and focus restoration work; nested feature dialogs close independently. Resizing into mobile closes the desktop dialog. ZUNO's existing Local Pin wordmark appears in the header and panel.

The shared settings SVG keeps the outline gear shape. Its color, size and background follow the same contextual rules as neighboring icons; there is no settings-only background or color override. Existing account colors, routes, account shortcuts, sidebar and other menus remain unchanged. No dependencies, framework configuration, database changes or SQL migrations.

## Design and validation

Accepted preview: `exec-4572defa-39f7-4fc2-818e-5fe41c935290.png` in the conversation's generated-image directory. The compact full-width hero follows the earlier corrected preview `exec-f9ec97e8-f1ad-4002-8957-cc7cfc00e8bf.png`.

Playwright Chromium was used because no Browser/IAB automation tool was available. Disposable local Supabase fixture data was used, not the hosted service. Viewports checked: 320, 390, 768 and 1440px, with English, Uzbek, Korean and Russian; Vietnamese is covered by translation tests and additional browser review. Native concept board dimensions span two distinct device views, so implementation was inspected at actual device sizes rather than treating the presentation board as one viewport.

Fidelity ledger, checked against browser screenshots with view_image:

| Surface | Comparison and resolution |
| --- | --- |
| Hero container | Full width retained, height reduced; measured 214–246px on mobile and 250–280px on wide desktop across tested languages. Long tablet translations may need more height. |
| Branding | Existing ZUNO + Local Pin SVG reused, including the panel; no substitute logo. |
| Explore panel | Homepage panel aligned with the left menu button, white rounded panel, search and vertical group cards retained. All 18 existing feature rows preserved rather than replacing them with mockup names. |
| Icons | Shared outline gear shape; settings uses the same contextual color, size and background as neighboring line icons. |
| Filters | Small category pills, compact toolbar and two-field price row; labels remain associated with inputs, focus indicators remain visible. |
| Typography and copy | Smaller responsive headings/control text; no horizontal overflow at tested widths. Existing interface copy takes precedence over illustrative mockup copy. |
| Account | Original dark account design intentionally preserved; the generated white account example was not applied because the user required existing menus/design to remain. |

Above-fold copy review: existing navigation, category labels, hero stories, both CTAs and filter functions retained. Only localized 'Filters' disclosure and 'Close' control copy added. The panel repeats the existing brand. Actual fixture listing counts/images differ from illustrative sample product cards in the concept.


## Homepage palette

The homepage canvas is solid white (#FFFFFF), following the user's latest request. The previous Soft Mint tint and corner glow are removed. The profile SVG remains a teal circle with a white silhouette, and the homepage menu trigger keeps the same #0D9488 background with white grid lines. Hover colors use #0F766E. No carousel, layout, menu or filtering changes.

Scoped surface styles remain in `src/features/marketplace/soft-mint.css` to avoid unnecessary file/import changes. Existing white header/listing surfaces and the account/messages page colors are preserved. The earlier 320/390/768/1440px layout and menu checks remain applicable; this follow-up only changes the canvas background declarations.

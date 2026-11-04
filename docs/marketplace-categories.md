# Product categories and 3D icons

The marketplace now has 18 browsing choices: All items, Electronics, Home & Living, Fashion, Sports, Books, Phones & Tablets, Computers, Furniture, Appliances, Baby & Kids, Beauty & Care, Pet Supplies, Outdoor & Camping, Tools & DIY, Games & Hobbies, Musical Instruments, and Other. These describe physical goods for buying/selling; no jobs, services, subscriptions or events were added.

`src/features/categories/catalog.ts` defines category names, stable slugs and icon sprite coordinates. Listing constants derive the category-name union from that catalog, so URL validation and database listing mapping recognize the expanded taxonomy. Original category names/slugs remain intact. All labels have Uzbek, Korean, Russian and Vietnamese translations alongside English.

The category navigation uses real transparent 3D raster illustrations, with accessible text labels and pressed states. There are three optimized WebP atlases rather than eighteen separate image requests (about 250 KB total). CSS clips one of six square cells from each atlas without modifying the art. Desktop/mobile sizes are 64/52px; the rail scrolls horizontally, and selected categories stay in view after selection or resizing. The desktop Filters button stays to the left of All items. Other navigation, hero, filtering and branding remain.

## Database rollout

Run `supabase/migrations/202611040017_expanded_marketplace_categories.sql` in the project's Supabase SQL Editor, or through the normal migration deployment. The migration upserts category rows by their existing unique slug; it does not replace IDs or change listing foreign keys. Existing Other moves to the end of the sort order. Re-running is safe.

**The hosted database migration has not been applied by Codex.** Until it is run, the new browsing filters can have no matching listings and the posting/edit category dropdowns will not offer the newly seeded rows. Those dropdowns already read the categories table; they require no form redesign. Public lookup caching revalidates after about 60 seconds (or refreshes with a new deployment).

No packages or Next configuration changes are required. The existing lookup permissions and name-based search RPC continue to work.

## Generated assets and provenance

Built-in imagegen was used, not the API/CLI fallback. The supplied shopping-icon reference guided the rounded clay style; logos, promotional lettering and unrelated service icons were not copied. Original generated PNGs remain in the conversation's generated-image directory. Final project assets:

- `public/images/categories/essentials.webp` (source `exec-e7a843ec-99e9-4a48-9f78-6b2ecc7cd146.png`)
- `public/images/categories/devices-home.webp` (source `exec-1c57c020-ef6a-4909-a2a8-64b0722b2f40.png`)
- `public/images/categories/hobbies-more.webp` (source `exec-5b15cf94-f05a-426f-aece-7e710fa1ab42.png`)

Final prompt set (shared specification): transparent 1536×1024 PNG, three columns by two rows of equal square cells; each icon centered with transparent margins; premium rounded clay 3D material, three-quarter view, upper-left light, teal/coral/blue/lavender/cream palette, subtle contact shadows; no text, logos, grid lines or backgrounds. Each sheet has these six groups in row-major order:

1. Essentials: teal shopping basket with cream parcel; blue camera and cream headphones; coral armchair with mint plant; lavender sweater and cream sneaker; blue basketball with coral dumbbell; teal/coral/cream books.
2. Devices/home: blue smartphone and lavender tablet; teal laptop and cream mouse; pale wood drawers and coral lamp; cream washer with teal door and coral kettle; coral stroller and teal teddy; lavender pump bottle, coral tube and cream jar.
3. Hobbies/more: teal pet bowl, paw toy and coral collar; mint tent with coral sleeping bag; cream toolbox and blue drill; lavender game controller with puzzle cubes; wooden guitar and teal keyboard; teal/coral parcels with cream star tag.

Assets were converted to 768×512 WebP with alpha preserved, quality 86 and alpha quality 100. Original generated images are retained; no existing assets were overwritten.

## Verification

73 Node tests cover existing validations plus category URL round-trips, database-row mapping, agreement between posting seed and browsing catalog, all category translations, and real sprite dimensions/transparency/size. The Node test harness was adjusted to register runtime resolution before loading the now-dependent listing constants; a local alias hook allows the mapper contract test.

ESLint, TypeScript and production build are checked. Playwright Chromium with an isolated local fixture (no production data) verifies 18 visible category buttons, new-category empty states, legacy Electronics results, responsive horizontal scrolling, selected-item visibility after resizing and posting dropdown integration. Desktop/mobile screenshots were visually inspected against the reference's rounded 3D style. English, Uzbek, Korean and Russian layouts were checked at 320/390/768/1440px without horizontal page overflow; Vietnamese is checked through translations and a browser pass.

The SQL migration is validated against the catalog contract, not executed against the hosted database in this task.

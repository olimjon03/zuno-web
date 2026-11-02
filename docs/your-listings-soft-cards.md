# Your listings — accepted Soft Cards design

Reference: `/Users/tojiboevolimjon/.codex/generated_images/01a19b1b-a4ae-7ea2-8aa4-f1f3204bd684/exec-0806a5d3-1264-4241-a3ab-2c7df726c664.png`, center panel 02. User override: replace top Mark available with Mark reserved.

## Design system before implementation

- True white page/surfaces; charcoal #1F2328, muted #667085, borders #E5EBE9, teal #0F766E, mint #E9FBF6 and destructive red #DC2626. No image overlay.
- Existing Geist typeface: page title 30px mobile/38px desktop, product title 20px/22px, price 17px, location 13px, actions 14px medium, labels 14px.
- Centered single-column list; 16px mobile gutters, max 760px desktop. Product summary card, mint status strip, edit disclosure, then separate removal disclosure. Rounded 18–20px surfaces, subtle border/shadow, 16–20px gaps.
- Header keeps existing ZUNO local-pin brand, circular Back and Home controls. Item title/price/location/status left, real cover photo in an approximately 100px square at the right. No illustrative camera or price is inserted into production data.
- Status buttons: outlined clock for Mark reserved; outlined shopping bag/check for Mark sold. Disabled when already in that status. Pencil for Edit item details; trash and red text for Remove item; chevrons rotate on open.
- Photos belong inside the expanded Edit item details area, above one Save changes control. Retain add/remove/cover and ten-photo limits. Existing category/condition/location/description fields remain required; availability is editable inside details so an owner can reopen an item without a Mark available top button.
- Existing Sell an Item entry and listing-count/empty/error notices remain, because they support the live multi-item page. Disclosures start closed to keep multiple listings scannable. Preserve the established floating mobile dock.

## Save behavior

Details and photos use existing authenticated mutations. Save changes validates the photo selection, saves details, then saves changed photos. If photo persistence fails after details succeed, show an explicit partial-success message and keep photo selections for retry. No nested HTML forms or additional migration is needed. Status/remove controls work independently of invalid edit drafts.

## Fidelity and browser verification

Accepted board is 1536×1024 with three alternatives. The selected center panel was checked at approximately its native panel size, 468×1024; also checked 390×844 mobile, 1440×1000 desktop and widths 320/680/1024. Browser/IAB control is unavailable in this session, so Playwright Chromium was used. Both the accepted board and final browser screenshots were inspected using view_image in the same QA pass. Screenshots are temporary QA artifacts, not shipped UI assets.

| Comparison | Accepted evidence and final implementation |
| --- | --- |
| Layout | Product summary with right-aligned image, mint status strip, editing disclosure, then separate removal disclosure. No nested forms. |
| Palette/container | True white surfaces, subtle shadows, 20px rounded cards, mint strip and teal primary action. Red trash action matches the destructive treatment. |
| Typography | Existing Geist, bold 20/22px product name, 17px price, quieter 13px location; 30px mobile title and 38px desktop title. Controls have explicit readable sizes. |
| Icons | Pencil/edit, outlined bag/check/sold, trash/remove and rotating disclosure chevrons. Clock/reserved is the requested replacement for the concept's check/available action. |
| Imagery | Actual first listing photo is the right-side cover; current uploads populate the photo rail. Missing cover uses a neutral image icon. Production data is not replaced with the illustrative camera. |
| Photo workflow | Photos are inside Edit item details, with a cover badge, add tile and cover/remove icon buttons. One Save changes control saves details and changed photos. |
| Responsive/spacing | Single centered desktop column, 16px mobile gutters, horizontal thumbnail rail for many photos. Fixed a hidden-file-input overflow and tightened the title/CTA row to match the reference's first viewport. |

Above-the-fold copy audit: Your listings, product fields/status, Edit item details and Remove item retained. Mark available becomes Mark reserved per user instruction. Sell an Item is retained in the title row from the existing working page; the listing count moves below the list. No invented metrics, marketing sections or unrelated actions.

Intentional production differences: existing ZUNO mark and floating dock are preserved; disclosures default closed for a multi-listing page. The actual item/photo/location replace the concept's sample values. Existing required category/condition/country/area/description fields and an Availability selector remain inside the editor, so the expanded live form is longer than the simplified concept. Price input uses editable whole digits with its currency in the label. Photo-size guidance and icon controls remain visible to support the real upload workflow.

Functional QA: status changes bypass invalid edit drafts without losing them; reserve/sold transitions work; Availability reopens an item; combined detail/cover/add-photo save persists; partial photo failure is explicit and preserves selection for retry; failed detail save preserves drafts; reload verifies saved photos. The existing owner/authorization checks remain in force. No real user records were changed. No new migration, dependency or Next configuration change.

Production-mode verification used fresh pages after streaming settled, with all visible images loaded and reduced motion for still captures. This avoided development-overlay and transitional-frame artifacts. Both native-panel and desktop expanded views plus mobile collapsed view were visually compared to the accepted board. Final widths 320/390/468/680/1024/1440 had no horizontal overflow. Confirmed removal and the shared Sell-page photo picker also passed. No material visual mismatches remain beyond the intentional workflow/data differences listed above.

Final checks: ESLint, TypeScript/production build and all 26 Node tests passed. Existing deployment configuration was restored after isolated production QA. No new SQL needs to be run for this change.

Changed surfaces: account/listings page shell; ManageListing and embedded EditListingPhotos; reusable compact PhotoPicker; shared SVG icons and scoped global styles; optional validated availability in manage-actions; availability validation test.

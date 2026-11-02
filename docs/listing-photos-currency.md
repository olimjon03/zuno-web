# Listing photos, local currency and filters

Branch: `codex/listing-photos-currency`. Apply `supabase/migrations/202611030009_listing_photo_management.sql` **after 001–008** in the Supabase SQL Editor before deploying this branch. No hosted migration or real-user mutation is performed by local QA.

## Behavior

- Create and edit accept up to ten photos. Originals may be up to 10 MiB each, JPG/PNG/WebP and at most 24 megapixels. Additive selection, removal and Make cover are available. At least one photo must remain.
- Browser preparation runs sequentially, resizing to at most 1600px and reducing each image to at most 320 KiB. Ten images fit within the existing 3.5 MiB image / 4 MiB multipart route budget. This avoids Vercel's 4.5 MB request limit: https://vercel.com/docs/functions/limitations . Original files remain on the device; server Sharp validates decoded content and strips metadata again. No dependencies or Next configuration changes.
- Photo edits use an authenticated, same-origin PATCH route and owner-only atomic RPC. Existing IDs are preserved when reordered. Expected image IDs detect conflicting tab edits; same-path retries are idempotent. Never delete attached objects after a lost response. Unattached replaced uploads are cleaned after success; temporary storage outages can leave unattached objects and require later cleanup.
- Uzbekistan amounts display as `so‘m`; Korea amounts display as `₩`. Currency is derived from the listing's stored neighborhood/region rather than the viewer's location, so switching browsing country never relabels a Korean amount as so‘m. There is no exchange-rate conversion. Changing an item's country requires choosing a new area and entering an appropriate amount.
- Migration 009 adds all 14 Uzbekistan administrative regions (12 provinces, republic and capital city) and all 17 Korean top-level regions as posting options. Original Seoul neighborhoods remain available. Region-level selection is not location verification.
- Owner status controls cover Available, Reserved and Sold. Removed items cannot have photos edited.
- Marketplace search, category and area filters combine with min/max price and Available only. Price filtering requires a country to avoid comparing different currencies. Country changes clear price bounds. Filtering currently applies to the latest 60 loaded listings; global pagination is future work.

## Validation

Node tests cover original/upload photo limits, bounded multipart and spoofed images, local money formatting and combined filters. Disposable PostgreSQL tests cover ten-photo publishing, atomic editing, ID preservation, stale updates, foreign/anonymous denial, invalid counts, region seeds and unchanged chat/read privacy. Browser QA uses local Auth/REST/storage fixtures only.

Production follow-up: apply 009, then use two test accounts to verify posting, photo edits, contact/chat and status changes on the deployed site. Google OAuth, real SMS/email and live-user conversations are not exercised by the isolated fixture.

Browser results: ten ~5 MB JPEG originals successfully published after browser optimization; ten detail thumbnails and so‘m display verified. Remove/add/cover edit persisted and cleaned replaced objects. Status transitions and switching an owner listing from Uzbekistan to Korea persisted with KRW display. Injected photo-save failure preserved the draft, and foreign-origin PATCH was denied. Search/price/country filters and country price-bound reset passed. Layouts at 320, 390, 680, 1024 and 1440px were checked for overflow.

Final checks: ESLint, TypeScript, production Next build and all 24 Node tests passed. All nine disposable SQL suites passed. No hosted migration was applied.

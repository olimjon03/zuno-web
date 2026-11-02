# Listing creation and photos

Apply `supabase/migrations/202611020002_listing_photos.sql` in Supabase SQL Editor after the initial marketplace migration. The owner already applied the initial migration. This second migration has not been applied to the hosted project by this change. Open SQL Editor → New query, paste the second migration, and Run. It creates the private photo bucket and publishing function automatically. No service-role key is needed in the app.

Signed-in users can open `/sell`, choose a category and neighborhood, and publish a title, description, condition, whole-KRW price and 1–3 photos. JPG/PNG/WebP inputs are limited to 2 MiB each and 3.5 MiB combined. The server bounds the multipart body, decodes and resizes images, strips metadata and saves WebP using the direct `sharp` dependency. The existing Next configuration is preserved.

Publishing atomically creates the listing and photo references. A stable submission ID makes retries idempotent. Failed uploads receive best-effort cleanup; an interrupted network connection can leave unreferenced private files requiring administrative cleanup. Storage policies prevent deleting referenced photos. Anonymous image responses check database visibility and use no-store caching.

The homepage loads the latest 60 visible listings. Empty or unavailable feeds show explicitly labelled sample items. Real detail pages display the photo gallery. Publishing is disabled with a status message until the migration is available. Editing, deleting, messaging and persistent favorites are future work; existing favorites remain local to the current visit.

## Verification

Run `npm run lint`, `npm run build`, and `node --test tests/*.test.mjs`. Tests cover fields, photo limits, bounded request parsing and image sanitization. A temporary PostgreSQL/PGlite harness passed the initial RLS suite before the second migration, then the new `supabase/tests/listing-photos.sql` suite after both migrations. SQL fixtures are for disposable databases only and roll back their rows.

Playwright with disposable local Auth/REST/Storage fixtures covered login, publishing, failed-publish cleanup and retry, galleries, homepage/search, and mobile widths of 320/390/768 pixels. These fixtures do not verify the hosted Storage API. After applying the migration, manually publish an item in the hosted project and check its photos from a signed-out browser.

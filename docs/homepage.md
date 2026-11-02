# ZUNO homepage

The homepage uses sample listings only. Search, category and neighborhood filters combine in browser state. Favorites are shared between the homepage and listing detail routes during the current app visit; a full reload clears them. Login links to the Supabase-backed auth flow; selling opens an explanatory demo dialog; listing cards link to dedicated `/listings/[id]` pages. Marketplace browsing and favorites remain browser-only; auth forms submit to Supabase Auth. See `docs/supabase-setup.md`.

## Structure

- `src/app/page.tsx`: server entry composing the interactive homepage.
- `src/features/marketplace/homepage.tsx`: page composition and browser state.
- `src/components/layout/header.tsx`: brand, neighborhood selector, search and login.
- `src/features/categories/components/category-nav.tsx`: reusable category navigation.
- `src/features/listings/sample-listings.ts`: typed sample data and KRW formatting.
- `src/features/listings/components/listing-card.tsx`: reusable listing links and favorite controls.
- `src/features/listings/components/listing-detail.tsx`: responsive detail layout, single-photo viewer and contact demo.
- `src/features/listings/sample-details.ts`: clearly fictional descriptions, condition and seller data.
- `src/features/favorites/favorites-provider.tsx`: shared browser state across route navigation.
- `src/app/listings/[id]/`: server route, per-listing metadata, static sample paths, loading, error and not-found UI.
- `src/components/ui/`: SVG icons and native modal dialog with focus restoration.
- `src/app/globals.css`: brand tokens and responsive styles; 4, 3 and 2 listing columns on desktop, tablet and mobile.
- `src/app/layout.tsx`: ZUNO metadata, retaining the existing fonts and layout setup.
- `public/images/`: locally bundled sample imagery, optimized through Next Image.

No dependencies or Next.js configuration changes are needed.

## Assets

Hero: AI-generated still life for ZUNO. The listing images are illustrative sample photos from Unsplash, not actual seller uploads:

| File           | Source                                                       |
| -------------- | ------------------------------------------------------------ |
| laptop.jpg     | https://images.unsplash.com/photo-1517336714731-489689fd1ca8 |
| table.jpg      | https://images.unsplash.com/photo-1617806118233-18e1de247200 |
| headphones.jpg | https://images.unsplash.com/photo-1546435770-a3e426bf472b    |
| chair.jpg      | https://images.unsplash.com/photo-1598300042247-d088f8ab3a91 |
| camera.jpg     | https://images.unsplash.com/photo-1516035069371-29a1b244cc32 |
| sneakers.jpg   | https://images.unsplash.com/photo-1542291026-7eec264c27ff    |
| books.jpg      | https://images.unsplash.com/photo-1544947950-fa07a98d237f    |
| lamp.jpg       | https://images.unsplash.com/photo-1507473885765-e6ed057f782c |

## Manual checks

Run `npm ci`, `npm run lint`, `npm run build`, and `npm start`.

Check desktop, tablet and narrow mobile widths. Search for a title, combine category and neighborhood filters, check no-results recovery, toggle favorites, open a listing, and open the login page and selling dialog. Verify Escape closes dialogs and returns focus to their trigger. Keyboard users can skip to listings, navigate all controls, and see focus outlines.

# Separate neighborhood changes

Change neighborhood opens a dedicated mode in Profile settings, including the existing Account link to `#profile-neighborhood`. That mode shows Country followed by Region / neighborhood and Save neighborhood; no display-name input is shown. Edit profile keeps the country picker out of its main view, with name, email, photo and a neighborhood shortcut instead.

Area options carry the existing `region_code` metadata. Uzbekistan and South Korea are filtered separately, grouped by the existing country catalog. Switching country clears the old area. An existing area preselects its country; unknown places are excluded instead of being guessed. Only the four original Seoul seed areas retain the existing legacy fallback.

`updateNeighborhood` derives the user from verified Auth, validates the selected country/area pair against the database, and updates only `neighborhood_id`. Forged display-name/identity fields are ignored. Account, Settings and public profile paths are revalidated after success. No SQL migration, dependency, Next configuration or stylesheet change is required.

Validation: lint, production build/TypeScript and all 47 Node tests pass. New tests cover country filtering, invalid inputs, cross-country rejection and the neighborhood-only update payload. Isolated Playwright checks cover the Account shortcut, absence of a name input, switching both directions, clearing the previous area, retained selection after a failed save, retry, reload persistence, unchanged display name and 390 px mobile layout. Hosted configuration and actual mobile hardware were not exercised.

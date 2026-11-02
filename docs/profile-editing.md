# Profile editing

Account now provides an Edit profile form for display name and optional neighborhood. The existing private `profiles` table, owner RLS, neighborhood foreign key and column grants support this feature; no migration, dependency, environment or Next configuration change is needed.

The server verifies Auth on every save, derives the profile ID from that user and only writes `display_name` and `neighborhood_id`. Display names use 2–40 Unicode code points. A selected neighborhood must exist; the empty selection clears it. Email is displayed from verified Auth but is not editable in this form. Other profile IDs, identity fields and arbitrary form fields are not accepted as update targets. Errors retain controlled form values and the page revalidates after a successful save.

The profile table is now the source of the account display name. New listing publication reads this name from the private owner row before uploading photos. The existing chat start RPC already snapshots the buyer name from that row. Existing listing and conversation names remain snapshots. Changing this profile does not change the name in the user's external Google account. Neighborhood is an optional saved profile preference, not verified location or a change to existing listing locations.

Validation: lint/build and 15 Node tests, including Unicode, optional neighborhoods and malformed fields. The temporary PGlite harness runs `supabase/tests/profile-editing.sql` after all current migrations and checks own update, clearing, unknown neighborhood rejection, identity mutation denial, other-user privacy and anonymous denial. Fixtures roll back; do not run them against a hosted marketplace.

Local Playwright fixtures cover anonymous access redirect, save/reload persistence, failure retention and retry, clearing the neighborhood, responsive widths 320/390/768/1440 and publishing a new listing with the edited profile name. Automated tests do not modify any real user's profile. Hosted profile saving remains an owner check after deploying the branch.

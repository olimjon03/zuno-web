export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("Supabase environment variables are not configured.");
  return { url, key };
}

export function getSiteUrl() {
  // A configured origin avoids trusting a user-supplied Host header for auth links.
  let value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  // Vercel supplies these trusted deployment values. Never derive auth redirects
  // from request Host/forwarded headers, which visitors can influence.
  if (!value && process.env.VERCEL === "1") {
    const domain =
      process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_URL;
    if (domain && /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(domain))
      value = `https://${domain}`;
  }
  if (!value) throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  ) {
    throw new Error("Use HTTPS for the public site URL.");
  }
  return url.origin;
}

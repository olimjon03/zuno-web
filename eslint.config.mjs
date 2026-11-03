import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/features/listings/components/**/*.{ts,tsx}",
      "src/features/listings/client/**/*.{ts,tsx}",
      "src/features/search/client/**/*.{ts,tsx}",
      "src/features/marketplace/homepage.tsx",
      "src/features/messages/*.tsx",
      "src/features/profile/*.tsx",
      "src/features/favorites/*.tsx",
      "src/features/messages/client/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { regex: "(?:^|/)server/(?!(?:actions|unread-actions)(?:$|\\.))", message: "Client UI must use shared types and server actions, not server services." },
        { regex: "^(?:node:|sharp$|@/lib/supabase/(?:server|public)$)", message: "Keep Node and database services behind the server boundary." },
      ] }],
    },
  },
  {
    files: [
      "src/features/listings/{types,constants,validation,currency}.ts",
      "src/features/search/{types,validation,pagination}.ts",
      "src/features/profile/{types,validation}.ts",
      "src/features/messages/{types,validation,inbox-model,message-model,refresh-queue}.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { regex: "(?:^|/)(?:server|client)/|^(?:node:|sharp$|server-only$|client-only$|@/lib/supabase/)", message: "Shared contracts must stay independent of server, browser and database services." },
      ] }],
    },
  },
  {
    files: ["src/app/account/page.tsx", "src/app/account/settings/page.tsx", "src/app/account/saved/page.tsx", "src/app/api/profile/avatar/route.ts", "src/app/messages/**/page.tsx", "src/app/messages/page.tsx", "src/app/page.tsx", "src/app/account/listings/page.tsx", "src/app/api/listings/**/route.ts", "src/app/api/marketplace/route.ts", "src/app/listing-photos/**/route.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { regex: "^(?:@/lib/supabase/|node:|sharp$)", message: "Keep page/route adapters thin; use a feature server service." },
      ] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

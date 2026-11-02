import { test } from "node:test";
import { getSiteUrl } from "../src/lib/supabase/config.ts";
import assert from "node:assert/strict";
import {
  readAuthFields,
  validateCredentials,
} from "../src/features/auth/validation.ts";

const valid = {
  email: "neighbor@example.com",
  password: "safe-long-pass",
  displayName: "Neighbor",
};
test("server validation rejects malformed, oversized and empty credentials", () => {
  for (const email of [
    "",
    "a@",
    "a b@example.com",
    "a".repeat(255) + "@example.com",
  ])
    assert.ok(validateCredentials({ ...valid, email }));
  for (const password of ["", "a".repeat(129)])
    assert.ok(validateCredentials({ ...valid, password }));
});
test("signup enforces name and password limits; existing shorter passwords may log in", () => {
  assert.ok(validateCredentials({ ...valid, password: "short" }, true));
  assert.equal(validateCredentials({ ...valid, password: "short" }), null);
  for (const displayName of ["", "A", "a".repeat(41)])
    assert.ok(validateCredentials({ ...valid, displayName }, true));
  assert.equal(validateCredentials(valid, true), null);
  assert.equal(
    validateCredentials({ ...valid, displayName: "민수" }, true),
    null,
  );
});
test("form parsing trims email/name, preserves password and rejects non-text input", () => {
  const data = new FormData();
  data.set("email", " neighbor@example.com ");
  data.set("displayName", " Neighbor ");
  data.set("password", " keep spaces ");
  assert.deepEqual(readAuthFields(data), {
    ...valid,
    password: " keep spaces ",
  });
  data.set("email", new Blob(["fake"]), "fake.txt");
  assert.equal(readAuthFields(data).email, "");
});

test("confirmation origin is configured, strips paths and rejects remote HTTP", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    for (const origin of [
      "http://example.com",
      "javascript:alert(1)",
      "not a URL",
    ]) {
      process.env.NEXT_PUBLIC_SITE_URL = origin;
      assert.throws(() => getSiteUrl());
    }
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://zuno.example/path?next=https://bad.example";
    assert.equal(getSiteUrl(), "https://zuno.example");
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3000";
    assert.equal(getSiteUrl(), "http://127.0.0.1:3000");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.throws(() => getSiteUrl());
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("Vercel callback origin uses trusted environment values, explicit configuration wins", () => {
  const names = [
    "NEXT_PUBLIC_SITE_URL",
    "VERCEL",
    "VERCEL_ENV",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "VERCEL_URL",
  ];
  const previous = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  try {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "zuno-web-wine.vercel.app";
    process.env.VERCEL_URL = "zuno-preview.vercel.app";
    assert.equal(getSiteUrl(), "https://zuno-web-wine.vercel.app");
    process.env.VERCEL_ENV = "preview";
    assert.equal(getSiteUrl(), "https://zuno-preview.vercel.app");
    process.env.NEXT_PUBLIC_SITE_URL = "https://zuno.example";
    assert.equal(getSiteUrl(), "https://zuno.example");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    for (const domain of [
      "evil.example/path",
      "user@evil.example",
      "https://evil.example",
      "evil.example?next=bad",
    ]) {
      process.env.VERCEL_URL = domain;
      assert.throws(() => getSiteUrl());
    }
    process.env.VERCEL = "0";
    process.env.VERCEL_URL = "zuno.vercel.app";
    assert.throws(() => getSiteUrl());
  } finally {
    for (const name of names)
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
  }
});

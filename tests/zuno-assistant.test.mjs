import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import "./helpers/register-runtime.mjs";

let signedIn = true;
let allowed = true;
globalThis.__zunoAssistantMock = {
  user: async () => ({ data: { user: signedIn ? { id: "fixture-user" } : null }, error: null }),
  db: async () => ({ rpc: async () => ({ data: allowed, error: null }) }),
};
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "@/features/auth/server/user") {
      return { url: "data:text/javascript,export const getVerifiedUser=globalThis.__zunoAssistantMock.user", shortCircuit: true };
    }
    if (specifier === "@/lib/supabase/server") {
      return { url: "data:text/javascript,export const createClient=globalThis.__zunoAssistantMock.db", shortCircuit: true };
    }
    return next(specifier, context);
  },
});
const { askZunoAssistant } = await import("../src/features/support/zuno-assistant-action.ts");

test("assistant only returns approved topics and does not call the model without access or quota", async t => {
  const priorKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "fixture-key";
  t.after(() => {
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
  });
  let calls = 0;
  let modelOutput = { topic: "sell", answer: "Untrusted free-form answer" };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls++;
    const request = JSON.parse(options.body);
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent");
    assert.equal(options.headers["x-goog-api-key"], "fixture-key");
    assert.equal(request.tools, undefined);
    assert.equal(request.generationConfig.responseMimeType, "application/json");
    assert.equal(request.generationConfig.responseJsonSchema.additionalProperties, false);
    return Response.json({
      candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(modelOutput) }] } }],
    });
  });
  const form = new FormData();
  form.set("question", "ZUNO’da e’lon qanday joylayman?");
  assert.deepEqual(await askZunoAssistant({}, form), { topic: "sell" });
  modelOutput = { topic: "outside" };
  assert.match((await askZunoAssistant({}, form)).message, /only answer/);
  modelOutput = { topic: "constructor" };
  assert.match((await askZunoAssistant({}, form)).message, /only answer/);
  signedIn = false;
  assert.match((await askZunoAssistant({}, form)).message, /Sign in/);
  signedIn = true;
  allowed = false;
  assert.match((await askZunoAssistant({}, form)).message, /limit/);
  assert.equal(calls, 3);
});

test("Gemini failures stay private and missing configuration never calls the provider", async t => {
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
  });
  signedIn = true;
  allowed = true;
  const form = new FormData();
  form.set("question", "How do I sell on ZUNO?");
  let response;
  let calls = 0;
  const logs = [];
  t.mock.method(console, "warn", (...args) => logs.push(args));
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    if (response instanceof Error) throw response;
    return response;
  });
  process.env.GEMINI_API_KEY = "  ";
  assert.match((await askZunoAssistant({}, form)).message, /unavailable/);
  assert.equal(calls, 0);
  process.env.GEMINI_API_KEY = "fixture-secret";
  for (const status of [400, 403, 429, 503]) {
    response = Response.json({ error: { status: "RESOURCE_EXHAUSTED", message: "fixture-secret private question" } }, { status });
    assert.match((await askZunoAssistant({}, form)).message, /unavailable/);
  }
  for (const payload of [
    {},
    { candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: '{"topic":"sell"}' }] } }] },
    { candidates: [{ finishReason: "SAFETY" }] },
    { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "invalid JSON" }] } }] },
  ]) {
    response = Response.json(payload);
    assert.match((await askZunoAssistant({}, form)).message, /unavailable/);
  }
  response = new DOMException("fixture-secret private question", "TimeoutError");
  assert.match((await askZunoAssistant({}, form)).message, /unavailable/);
  assert.doesNotMatch(JSON.stringify(logs), /fixture-secret|private question/);
});

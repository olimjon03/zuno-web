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
  const priorKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "fixture-key";
  t.after(() => {
    if (priorKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = priorKey;
  });
  let calls = 0;
  let modelOutput = { topic: "sell", answer: "Untrusted free-form answer" };
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    calls++;
    const request = JSON.parse(options.body);
    assert.equal(request.store, false);
    assert.equal(request.tools, undefined);
    assert.equal(request.text.format.strict, true);
    return Response.json({
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(modelOutput) }] }],
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

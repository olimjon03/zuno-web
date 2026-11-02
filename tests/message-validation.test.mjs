import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
// Next resolves extensionless TS imports; mirror that resolution in this Node-only test.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith("."))
        return nextResolve(specifier + ".ts", context);
      throw error;
    }
  },
});
const { parseMessage } = await import("../src/features/messages/validation.ts");
const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
test("chat validates IDs, trims body and counts Unicode characters", () => {
  assert.deepEqual(parseMessage(id, id, "  Hello  "), {
    conversationId: id,
    clientId: id,
    body: "Hello",
  });
  for (const value of ["", " \n\t", null, "a".repeat(2001)])
    assert.throws(() => parseMessage(id, id, value));
  assert.throws(() => parseMessage("wrong", id, "Hello"));
  assert.throws(() => parseMessage(id, "wrong", "Hello"));
  assert.equal(
    Array.from(parseMessage(id, id, "😀".repeat(2000)).body).length,
    2000,
  );
});

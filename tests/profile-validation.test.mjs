import test from "node:test";
import assert from "node:assert/strict";
import { parseProfile } from "../src/features/profile/validation.ts";
function form(name = "Neighbor", area = "") {
  const data = new FormData();
  data.set("displayName", name);
  data.set("neighborhoodId", area);
  return data;
}
test("profile accepts trimmed Unicode names and optional neighborhood without identity fields", () => {
  const data = form("  민수 😀  ", "2");
  data.set("id", "another-user");
  data.set("email", "forged@example.invalid");
  assert.deepEqual(parseProfile(data), {
    displayName: "민수 😀",
    neighborhoodId: 2,
  });
  assert.deepEqual(parseProfile(form()), {
    displayName: "Neighbor",
    neighborhoodId: null,
  });
  assert.equal(
    Array.from(parseProfile(form("😀".repeat(40))).displayName).length,
    40,
  );
});
test("profile rejects malformed names, non-text fields and unsafe neighborhood IDs", () => {
  for (const name of ["", " a ", "a".repeat(41)])
    assert.throws(() => parseProfile(form(name)));
  for (const area of ["0", "-1", "1.5", "1e3", " 1", "9007199254740992", "x"])
    assert.throws(() => parseProfile(form("Neighbor", area)));
  const data = form();
  data.set("displayName", new Blob(["name"]), "name.txt");
  assert.throws(() => parseProfile(data));
  const missing = form();
  missing.delete("neighborhoodId");
  assert.throws(() => parseProfile(missing));
});

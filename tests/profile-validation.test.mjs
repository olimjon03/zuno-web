import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/register-runtime.mjs";
const { parseProfile, parseNeighborhood } = await import("../src/features/profile/validation.ts");
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

test("neighborhood changes require a valid country and positive area ID without a name",()=>{
 const data=new FormData();data.set("country","UZ");data.set("neighborhoodId","3");
 assert.deepEqual(parseNeighborhood(data),{country:"UZ",neighborhoodId:3});
 data.set("displayName","forged");assert.deepEqual(parseNeighborhood(data),{country:"UZ",neighborhoodId:3});
 for(const country of ["","US","uz"]){data.set("country",country);assert.throws(()=>parseNeighborhood(data));}
 data.set("country","KR");for(const area of ["","0","-1","1e3","9007199254740992"]){data.set("neighborhoodId",area);assert.throws(()=>parseNeighborhood(data));}
});
const {profileAreasForCountry,profileAreaCountry}=await import('../src/features/profile/location.ts');
test('profile area choices separate countries and exclude unknown locations',()=>{
 const areas=[{id:1,name:'Seongsu-dong',regionCode:'KR-11'},{id:2,name:'Seoul Forest'},{id:3,name:'Toshkent shahri',regionCode:'UZ-TK'},{id:4,name:'Unknown'}];
 assert.deepEqual(profileAreasForCountry(areas,'UZ').map(a=>a.id),[3]);
 assert.deepEqual(profileAreasForCountry(areas,'KR').map(a=>a.id),[1,2]);
 assert.deepEqual(profileAreasForCountry(areas,''),[]);
 assert.equal(profileAreaCountry(areas,'3'),'UZ');assert.equal(profileAreaCountry(areas,'4'),'');
});

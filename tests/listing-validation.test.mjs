import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { MAX_BODY_BYTES, MAX_PHOTO_BYTES } from "../src/features/listings/constants.ts";
import './helpers/register-runtime.mjs';
const {parseListingInput,parseAvailability,validatePhotos}=await import('../src/features/listings/validation.ts');
const {readBoundedForm,BodyTooLargeError}=await import('../src/features/listings/server/request-body.ts');
const {processPhoto}=await import('../src/features/listings/server/process-photo.ts');
const valid = () => {
  const d = new FormData();
  for (const [key, value] of Object.entries({
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Oak chair",
    description: "A comfortable chair for a new home.",
    price: "12000",
    categoryId: "1",
    neighborhoodId: "1",
    condition: "good",
  }))
    d.set(key, value);
  return d;
};
test("listing input rejects malformed IDs, fractional/negative prices and invalid choices", () => {
  assert.equal(parseListingInput(valid()).price, 12000);
  for (const [field, value] of [
    ["id", "not-a-uuid"],
    ["price", "-1"],
    ["price", "1.5"],
    ["price", "1e3"],
    ["price", "1000000000001"],
    ["categoryId", "0"],
    ["neighborhoodId", "1.2"],
    ["condition", "excellent"],
    ["title", "ab"],
    ["description", "short"],
  ]) {
    const d = valid();
    d.set(field, value);
    assert.throws(() => parseListingInput(d), field);
  }
  const free = valid();
  free.set("price", "0");
  assert.equal(parseListingInput(free).price, 0);
  const unicode = valid();
  unicode.set("title", "🪑");
  assert.throws(() => parseListingInput(unicode));
});
test("photos enforce count, types, per-file and combined sizes", () => {
  assert.equal(validatePhotos([{ type: "image/jpeg", size: 500 }]), null);
  assert.equal(validatePhotos(Array(10).fill({type:"image/jpeg",size:MAX_PHOTO_BYTES})),null);
  assert.ok(validatePhotos(Array(10).fill({type:"image/jpeg",size:MAX_PHOTO_BYTES}),true));
  assert.equal(validatePhotos(Array(10).fill({type:"image/webp",size:320*1024}),true),null);
  for (const files of [
    [],
    Array(11).fill({ type: "image/png", size: 2 }),
    [{ type: "image/svg+xml", size: 200 }],
    [{ type: "image/png", size: 0 }],
    [{ type: "image/jpeg", size: MAX_PHOTO_BYTES + 1 }],
  ])
    assert.ok(validatePhotos(files));
});
test("bounded multipart parser rejects declared and streamed oversized bodies", async () => {
  const data = valid();
  const request = new Request("http://localhost", {
    method: "POST",
    body: data,
  });
  assert.equal(
    (await readBoundedForm(request, MAX_BODY_BYTES)).get("title"),
    "Oak chair",
  );
  const declared = new Request("http://localhost", {
    method: "POST",
    headers: {
      "content-type": "multipart/form-data; boundary=x",
      "content-length": "200",
    },
    body: "x",
  });
  await assert.rejects(readBoundedForm(declared, 100), BodyTooLargeError);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(101));
      controller.close();
    },
  });
  const chunked = new Request("http://localhost", {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=x" },
    body: stream,
    duplex: "half",
  });
  await assert.rejects(readBoundedForm(chunked, 100), BodyTooLargeError);
  await assert.rejects(
    readBoundedForm(
      new Request("http://localhost", {
        method: "POST",
        body: "not multipart",
      }),
      100,
    ),
  );
});
test("image processing rejects spoofed bytes and strips metadata while resizing", async () => {
  const bytes = await sharp({
    create: { width: 1800, height: 1000, channels: 3, background: "#ff7a00" },
  })
    .jpeg()
    .withMetadata()
    .toBuffer();
  const result = await processPhoto(
    new File([bytes], "chair.jpg", { type: "image/jpeg" }),
    MAX_PHOTO_BYTES,
  );
  const metadata = await sharp(result).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1600);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
  await assert.rejects(
    processPhoto(
      new File([bytes], "spoof.png", { type: "image/png" }),
      MAX_PHOTO_BYTES,
    ),
  );
  await assert.rejects(
    processPhoto(
      new File(["not an image"], "chair.jpg", { type: "image/jpeg" }),
      MAX_PHOTO_BYTES,
    ),
  );
});

test("availability edits cannot use removal or arbitrary status values",()=>{
  assert.equal(parseAvailability(null),undefined);
  for(const status of ["active","reserved","sold"])assert.equal(parseAvailability(status),status);
  for(const status of ["removed","moderated","",new File(["active"],"status.txt")])assert.throws(()=>parseAvailability(status));
});

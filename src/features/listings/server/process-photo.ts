import sharp from "sharp";
export async function processPhoto(
  file: File,
  maxBytes: number,
): Promise<Buffer> {
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { limitInputPixels: 24000000, failOn: "warning" });
  const metadata = await image.metadata();
  const types: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  if (
    !metadata.format ||
    types[metadata.format] !== file.type ||
    (metadata.pages ?? 1) > 1
  )
    throw new Error("Use still JPG, PNG or WebP photos.");
  // Re-encoding strips EXIF/GPS and other metadata by default.
  const output = await image
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  if (output.byteLength > maxBytes)
    throw new Error("This photo is too large after processing.");
  return output;
}

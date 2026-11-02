export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_PHOTO_BYTES = 3.5 * 1024 * 1024;
export const MAX_BODY_BYTES = 4 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const conditions = ["like_new", "good", "used"] as const;
export const conditionLabels = {
  like_new: "Like new",
  good: "Good",
  used: "Used",
};
export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export type ListingInput = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  neighborhoodId: number;
  condition: (typeof conditions)[number];
};
export function parseListingInput(data: FormData): ListingInput {
  const text = (name: string) =>
    typeof data.get(name) === "string" ? (data.get(name) as string).trim() : "";
  const id = text("id");
  const title = text("title");
  const description = text("description");
  const price = text("price");
  const category = text("categoryId");
  const neighborhood = text("neighborhoodId");
  const condition = text("condition");
  if (!isUuid(id)) throw new Error("Please reload the form and try again.");
  if (Array.from(title).length < 3 || Array.from(title).length > 120)
    throw new Error("Use a title between 3 and 120 characters.");
  if (
    Array.from(description).length < 10 ||
    Array.from(description).length > 5000
  )
    throw new Error("Use a description between 10 and 5,000 characters.");
  if (
    !/^\d+$/.test(price) ||
    !Number.isSafeInteger(Number(price)) ||
    Number(price) > 1000000000000
  )
    throw new Error("Enter a whole price between 0 and 1,000,000,000,000.");
  if (
    ![category, neighborhood].every(
      (value) =>
        /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)),
    )
  )
    throw new Error("Choose a category and neighborhood.");
  if (!conditions.includes(condition as ListingInput["condition"]))
    throw new Error("Choose the item’s condition.");
  return {
    id,
    title,
    description,
    price: Number(price),
    categoryId: Number(category),
    neighborhoodId: Number(neighborhood),
    condition: condition as ListingInput["condition"],
  };
}
export function validatePhotos(
  files: { size: number; type: string }[],
  uploaded = false,
): string | null {
  if (files.length < 1 || files.length > MAX_PHOTOS)
    return "Choose between 1 and 10 photos.";
  if (
    files.some(
      (file) =>
        !PHOTO_TYPES.includes(file.type) ||
        file.size < 1 ||
        file.size > MAX_PHOTO_BYTES,
    )
  )
    return "Use JPG, PNG or WebP photos up to 10 MB each.";
  if (uploaded && files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_PHOTO_BYTES)
    return "Keep the combined photo size below 3.5 MB.";
  return null;
}

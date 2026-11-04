import { categoryCatalog } from "../categories/catalog";
export const categories = categoryCatalog.map(category => category.name);
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

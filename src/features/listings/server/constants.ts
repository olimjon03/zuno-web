import "server-only";
export const PHOTO_BUCKET = "zuno-listing-photos";
export const LISTING_COLUMNS =
  "id,seller_id,title,description,price,condition,seller_name,created_at,status,category:categories(name_en),neighborhood:neighborhoods(name,region_code),photos:listing_images(id,sort_order)";

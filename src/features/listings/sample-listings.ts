export const categories = [
  "All items",
  "Electronics",
  "Home & Living",
  "Fashion",
  "Sports",
  "Books",
  "Other",
] as const;
export type Category = (typeof categories)[number];
export const neighborhoods = [
  "All nearby",
  "Seongsu-dong",
  "Songjeong-dong",
  "Seoul Forest",
  "Ttukseom",
] as const;
export type Neighborhood = (typeof neighborhoods)[number];
export type Listing = {
  id: string;
  title: string;
  price: number;
  neighborhood: Exclude<Neighborhood, "All nearby">;
  category: Exclude<Category, "All items">;
  image: string;
  imageAlt: string;
};
export const sampleListings: Listing[] = [
  {
    id: "laptop",
    title: "MacBook Pro 13-inch",
    price: 580000,
    neighborhood: "Seongsu-dong",
    category: "Electronics",
    image: "/images/laptop.jpg",
    imageAlt: "Close-up of a MacBook keyboard with purple lighting",
  },
  {
    id: "table",
    title: "Wooden dining table & chairs",
    price: 120000,
    neighborhood: "Songjeong-dong",
    category: "Home & Living",
    image: "/images/table.jpg",
    imageAlt: "Wooden dining table and chairs in a bright room",
  },
  {
    id: "headphones",
    title: "Over-ear wireless headphones",
    price: 45000,
    neighborhood: "Seongsu-dong",
    category: "Electronics",
    image: "/images/headphones.jpg",
    imageAlt: "Black over-ear headphones on a light desk",
  },
  {
    id: "chair",
    title: "A cozy accent chair",
    price: 40000,
    neighborhood: "Seoul Forest",
    category: "Home & Living",
    image: "/images/chair.jpg",
    imageAlt: "Upholstered accent chair with wooden legs",
  },
  {
    id: "camera",
    title: "Canon camera with lens",
    price: 320000,
    neighborhood: "Ttukseom",
    category: "Electronics",
    image: "/images/camera.jpg",
    imageAlt: "Black Canon camera with a lens",
  },
  {
    id: "sneakers",
    title: "Nike running shoes · size 250",
    price: 35000,
    neighborhood: "Seongsu-dong",
    category: "Sports",
    image: "/images/sneakers.jpg",
    imageAlt: "Red Nike running shoe against a red background",
  },
  {
    id: "books",
    title: "Milk and Honey · Rupi Kaur",
    price: 8000,
    neighborhood: "Seoul Forest",
    category: "Books",
    image: "/images/books.jpg",
    imageAlt: "Milk and Honey paperback on a wooden surface",
  },
  {
    id: "lamp",
    title: "Adjustable desk lamp",
    price: 25000,
    neighborhood: "Songjeong-dong",
    category: "Home & Living",
    image: "/images/lamp.jpg",
    imageAlt: "Gray adjustable desk lamp against a light wall",
  },
];
export const formatPrice = (price: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);

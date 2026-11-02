export type ListingDetails = {
  condition: string;
  description: string;
  seller: string;
  sellerId?: string;
  joined: string;
  postedAt?: string;
};
export const sampleDetails: Record<string, ListingDetails> = {
  laptop: {
    condition: "Good",
    description:
      "A 13-inch MacBook Pro looking for its next desk. Some light marks from everyday use. Includes a charging cable. You can check the screen, keyboard and ports when we meet.",
    seller: "Min",
    joined: "May 2026",
  },
  table: {
    condition: "Good",
    description:
      "A wooden dining table with matching chairs, ready for a new home. Light signs of use on the surface. Please arrange your own transport and check the dimensions before pickup.",
    seller: "Jisoo",
    joined: "April 2026",
  },
  headphones: {
    condition: "Like new",
    description:
      "Comfortable over-ear wireless headphones. Lightly used at home and kept clean. You are welcome to check the fit and sound at pickup.",
    seller: "Alex",
    joined: "June 2026",
  },
  chair: {
    condition: "Good",
    description:
      "A comfortable upholstered accent chair with wooden legs. A few signs of everyday use. Great for a reading corner. Local pickup only; please arrange transport.",
    seller: "Hana",
    joined: "March 2026",
  },
  camera: {
    condition: "Good",
    description:
      "A Canon camera with a lens for someone getting into photography. Light cosmetic wear. Please inspect the camera and lens in person before deciding.",
    seller: "Jun",
    joined: "May 2026",
  },
  sneakers: {
    condition: "Used",
    description:
      "Red Nike running shoes in size 250 mm. Worn with visible signs of use. Please check the fit and condition in person before buying.",
    seller: "Sam",
    joined: "July 2026",
  },
  books: {
    condition: "Good",
    description:
      "An English paperback copy of Milk and Honey by Rupi Kaur. Read once, with light wear on the cover. A small find for your next quiet afternoon.",
    seller: "Yuna",
    joined: "August 2026",
  },
  lamp: {
    condition: "Good",
    description:
      "A gray adjustable desk lamp for a work or reading space. Light cosmetic wear. You can check that it works at pickup.",
    seller: "Mina",
    joined: "May 2026",
  },
};

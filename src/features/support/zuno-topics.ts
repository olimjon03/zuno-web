export const helpTopics = {
  sell: {
    title: "Sell an item",
    answer: "Sign in, open Sell, add photos and details, then publish. Use Your listings to edit the listing or mark it reserved or sold.",
    href: "/sell",
  },
  buy: {
    title: "Find an item",
    answer: "On the homepage, choose your area and search or filter the listings. Open an item and message the seller to agree on a meetup.",
    href: "/",
  },
  messages: {
    title: "Messages",
    answer: "Open a listing to start a conversation with the seller. Go to Messages to read and reply. You can also send supported photos and files there.",
    href: "/messages",
  },
  trade: {
    title: "Confirm a trade",
    answer: "In Your listings, select Mark reserved or Mark sold. If you choose a buyer, the status appears in their chat. After the buyer confirms receipt, both people can leave optional feedback in that chat.",
    href: "/account/listings",
  },
  profile: {
    title: "Profile settings",
    answer: "Go to My ZUNO and choose Edit profile to update your profile. Use Change neighborhood in My ZUNO to select a different country or area.",
    href: "/account/settings",
  },
  safety: {
    title: "Safety & privacy",
    answer: "Meet in a public place and inspect the item before paying. Use the chat options to block a user or report a listing.",
    href: "/account/safety",
  },
  login: {
    title: "Log in",
    answer: "Open Log in and choose Continue with Google or enter your ZUNO email and password. If Google sign-in stalls inside another app, start again in your regular browser.",
    href: "/login",
  },
  saved: {
    title: "Saved items",
    answer: "Tap the bookmark on a listing to save it. Open Saved to find it later, or tap the bookmark again to remove it from Saved.",
    href: "/account/saved",
  },
} as const;

export type HelpTopic = keyof typeof helpTopics;

export function isHelpTopic(value: unknown): value is HelpTopic {
  return typeof value === "string" && Object.hasOwn(helpTopics, value);
}

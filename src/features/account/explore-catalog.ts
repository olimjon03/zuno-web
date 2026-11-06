import type { IconName } from "@/components/ui/icon";

export type ExploreFeature = { slug: string; title: string; description: string; icon: IconName };

export const exploreGroups: { title: string; entries: ExploreFeature[] }[] = [
  { title: "Community", entries: [
    { slug: "neighborhood-posts", title: "Neighborhood posts", description: "See what’s happening nearby.", icon: "chat" },
    { slug: "local-events", title: "Local events", description: "Read neighborhood posts from your district.", icon: "calendar" },
    { slug: "meetups", title: "Meetups", description: "Connect with neighbors.", icon: "people" },
  ] },
  { title: "Local services", entries: [
    { slug: "local-jobs", title: "Local jobs", description: "Discover opportunities nearby.", icon: "briefcase" },
    { slug: "home-services", title: "Home services", description: "Find help in your area.", icon: "settings" },
    { slug: "neighborhood-guide", title: "Neighborhood guide", description: "Explore useful places nearby.", icon: "pin" },
  ] },
  { title: "For business", entries: [
    { slug: "business-profile", title: "Business profile", description: "Showcase your business locally.", icon: "store" },
    { slug: "promote-listing", title: "Promote a listing", description: "Reach more neighbors.", icon: "arrow" },
    { slug: "business-insights", title: "Business insights", description: "Learn about your audience.", icon: "chart" },
  ] },
  { title: "Buying & selling", entries: [
    { slug: "purchase-history", title: "Purchase history", description: "View your past transactions.", icon: "list" },
    { slug: "recently-viewed", title: "Recently viewed", description: "See items you looked at.", icon: "search" },
    { slug: "search-alerts", title: "Search alerts", description: "Get notified about new listings.", icon: "bell" },
  ] },
  { title: "Preferences", entries: [
    { slug: "notifications", title: "Notifications", description: "Choose what you want to hear about.", icon: "bell" },
    { slug: "language", title: "Language & appearance", description: "Set your language and text size.", icon: "settings" },
    { slug: "location-verification", title: "Location verification", description: "Help keep ZUNO safe and local.", icon: "pin" },
  ] },
  { title: "Support", entries: [
    { slug: "announcements", title: "Announcements", description: "Get the latest updates from ZUNO.", icon: "bell" },
    { slug: "feedback", title: "Feedback", description: "Share your ideas with us.", icon: "chat" },
    { slug: "privacy", title: "Account & privacy", description: "Manage your account and data.", icon: "shield" },
  ] },
];

export const localPostKinds = new Set([
  "neighborhood-posts", "local-events", "meetups", "local-jobs", "home-services", "neighborhood-guide", "business-profile",
]);

export function getExploreFeature(slug: string) {
  return exploreGroups.flatMap(group => group.entries).find(entry => entry.slug === slug);
}

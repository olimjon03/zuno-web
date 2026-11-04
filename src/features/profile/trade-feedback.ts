export const feedbackReasons = {
  "on-time": "Arrived on time",
  "good-communication": "Good communication",
  "kept-agreement": "Kept the agreement",
  "as-described": "Item as described",
  "no-show": "Missed the meetup",
  "difficult-communication": "Difficult communication",
  "broke-agreement": "Did not keep the agreement",
  "not-as-described": "Item not as described",
} as const;

export function feedbackLevel(positive: number, negative: number) {
  const score = positive - negative;
  if (score >= 15) return { number: 3, name: "Experienced neighbor" };
  if (score >= 5) return { number: 2, name: "Active neighbor" };
  return { number: 1, name: "New neighbor" };
}

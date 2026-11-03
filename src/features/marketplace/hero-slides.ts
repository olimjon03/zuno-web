export const HERO_INTERVAL_MS = 5000;
export const heroSlides = [
 {
  id:"discover", first:"Good finds.", second:"Great neighbors.",
  description:"Give pre-loved things a new beginning, right here in your neighborhood.",
  image:"/images/hero-v2.webp",
  alt:"A wooden chair, plant, lamp and vintage camera ready for a new home",
 },
 {
  id:"sell", first:"Make space.", second:"Sell locally.",
  description:"Add up to 10 photos, describe your item, and choose a price. Your next sale starts with a simple listing.",
  image:"/images/hero-selling.webp",
  alt:"A neighbor photographing a second-hand camera for a listing",
 },
 {
  id:"connect", first:"Say hello.", second:"Meet nearby.",
  description:"Ask the seller a question in Messages. Agree on a public meeting place and inspect the item before paying.",
  image:"/images/hero-meeting.webp",
  alt:"Two neighbors inspecting a camera at a public cafe",
 },
 {
  id:"save", first:"See it. Save it.", second:"Find it later.",
  description:"Tap the bookmark on a listing to keep it in Saved. Compare your finds and come back when you’re ready.",
  image:"/images/hero-saved.webp",
  alt:"Headphones, a camera and books collected on a wooden table",
 },
] as const;

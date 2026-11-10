import { useSyncExternalStore } from "react";

let pageSeed = 0;

function subscribe() {
  return () => {};
}

function getClientSeed() {
  if (!pageSeed) pageSeed = 1 + Math.floor(Math.random() * 0xffffffff);
  return pageSeed;
}

export function useShuffleSeed() {
  return useSyncExternalStore(subscribe, getClientSeed, () => 0);
}

export function shuffleListings<T>(items: T[], seed: number): T[] {
  if (!seed || items.length < 2) return items;
  const shuffled = [...items];
  let random = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index--) {
    random ^= random << 13;
    random ^= random >>> 17;
    random ^= random << 5;
    const other = (random >>> 0) % (index + 1);
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

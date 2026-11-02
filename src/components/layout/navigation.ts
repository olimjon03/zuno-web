import type { IconName } from "@/components/ui/icon";
export type NavigationItem = { href: string; label: string; icon: IconName };
export const accountMenuItems: readonly NavigationItem[] = [
  {href:"/account",label:"My ZUNO",icon:"user"},
  {href:"/account/listings",label:"Your listings",icon:"list"},
  {href:"/account/saved",label:"Saved items",icon:"heart"},
  {href:"/messages",label:"Messages",icon:"chat"},
  {href:"/sell",label:"Sell an item",icon:"plus"},
  {href:"/account/settings",label:"Profile settings",icon:"settings"},
  {href:"/account/safety",label:"Safety & privacy",icon:"shield"},
  {href:"/help",label:"Help center",icon:"help"},
  {href:"/",label:"Back to marketplace",icon:"home"},
];
export const mobileMenuItems: readonly NavigationItem[] = [
  {href:"/",label:"Home",icon:"home"},
  {href:"/account/saved",label:"Saved",icon:"heart"},
  {href:"/sell",label:"Sell",icon:"plus"},
  {href:"/messages",label:"Chats",icon:"chat"},
  {href:"/account",label:"My ZUNO",icon:"user"},
];
export function isNavigationActive(path: string, href: string, accountSection = false) {
  if (href === "/") return path === "/";
  if (accountSection && href === "/account")
    return (path === "/account" || path.startsWith("/account/")) && !(path === "/account/saved" || path.startsWith("/account/saved/"));
  return path === href || (href !== "/account" && path.startsWith(`${href}/`));
}

import type { SVGProps } from "react";

export type IconName = "medal" | "globe" | "user-circle" | "sliders" | "grid" | "eye" | "bookmark" | "pencil" | "trash" | "clock" | "bag-check" | "check-circle" | "image" | "mail" | "heart" | "search" | "pin" | "arrow" | "plus" | "close" | "home" | "user" | "chat" | "settings" | "list" | "help" | "chevron" | "calendar" | "briefcase" | "bell" | "shield" | "book" | "store" | "chart" | "people";
const paths: Record<IconName, React.ReactNode> = {
  medal: <><path d="m5 3 4 8m10-8-4 8M5 3h4l3 6 3-6h4"/><circle cx="12" cy="16" r="5"/><path d="M12 14v4"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  "user-circle": <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><circle cx="12" cy="8.5" r="3" fill="#fff" stroke="none"/><path d="M6 18a6 6 0 0 1 12 0v.5H6Z" fill="#fff" stroke="none"/></>,
  sliders: <><path d="M3 6h4m4 0h10M3 12h10m4 0h4M3 18h4m4 0h10"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  bookmark: <path d="M6 3h12a2 2 0 0 1 2 2v15a1 1 0 0 1-1.65.76L12 15l-6.35 5.76A1 1 0 0 1 4 20V5a2 2 0 0 1 2-2Z"/>,
  pencil: <><path d="m15 4 5 5M4 20l5-1L21 7a2.1 2.1 0 0 0-5-3L4 16Z"/></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  "check-circle": <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  "bag-check": <><path d="M4 7h16l1 14H3ZM8 7V6a4 4 0 0 1 8 0v1m-8 7 3 3 5-6"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
  home: <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" />,
  user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3Z"/></>,
  chat: <path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z"/>,
  settings: <><path d="M9.3 3.7 10 2h4l.7 1.7 1.6.9 1.8-.2 2 3.4-1.1 1.4v1.8l1.1 1.4-2 3.4-1.8-.2-1.6.9-.7 1.7h-4l-.7-1.7-1.6-.9-1.8.2-2-3.4L5 11V9.2L3.9 7.8l2-3.4 1.8.2Z" transform="translate(0 1.9)"/><circle cx="12" cy="12" r="3.2"/></>,
  list: <path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01"/>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 3h.01"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h8"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 13h18m-11 0v3h4v-3"/></>,
  bell: <path d="M4 17h16l-2-4V9a6 6 0 0 0-12 0v4Zm6 4h4"/>,
  shield: <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Zm-4 9 3 3 5-6"/>,
  book: <path d="M3 3h8l1 2 1-2h8v17h-8l-1 1-1-1H3Zm9 2v16"/>,
  store: <path d="M4 10v11h16V10M2 10l3-7h14l3 7c-2 3-4 3-6 0-2 3-6 3-8 0-2 3-4 3-6 0Zm7 11v-7h6v7"/>,
  chart: <path d="M3 21h18M5 17v-5h3v5m3 0V7h3v10m3 0V3h3v14"/>,
  people: <><circle cx="12" cy="7" r="3"/><path d="M6 21v-4a6 6 0 0 1 12 0v4M3 5a3 3 0 0 0 0 6m18-6a3 3 0 0 1 0 6M2 15v5m20-5v5"/></>,
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="7" />
      <path d="m16 16 5 5" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
};
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-icon={name}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

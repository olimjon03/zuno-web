import type { SVGProps } from "react";
export function MessageIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: "attach" | "file" | "download" | "send" | "more" }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {name === "attach" && <path d="m8 12 7-7a3 3 0 0 1 4 4L9 19a5 5 0 0 1-7-7L13 1m-7 13 9-9"/>}
    {name === "file" && <><path d="M14 2H5v20h14V7ZM14 2v6h5"/><path d="M8 13h8M8 17h6"/></>}
    {name === "download" && <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>}
    {name === "send" && <path d="m22 2-7 20-4-9-9-4Zm0 0L11 13"/>}
    {name === "more" && <><circle cx="4" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="20" cy="12" r="1"/></>}
  </svg>;
}

import { Text } from "@/features/language/provider";
import { BackHomeNav } from "./back-home-nav";
export function SectionLoading({message = "Loading…"}: {message?: string}) {
  return <main className="shell section-loading"><BackHomeNav/><p role="status"><Text>{message}</Text></p><div className="loading-placeholder" aria-hidden="true"/></main>;
}

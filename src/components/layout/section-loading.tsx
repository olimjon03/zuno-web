import { BackHomeNav } from "./back-home-nav";
export function SectionLoading({message = "Loading…"}: {message?: string}) {
  return <main className="shell section-loading"><BackHomeNav/><p role="status">{message}</p><div className="loading-placeholder" aria-hidden="true"/></main>;
}

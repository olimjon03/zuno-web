import Link from "next/link";
import { BackHomeNav } from "@/components/layout/back-home-nav";
export default function NotFound() {
  return <main className="shell detail-message"><BackHomeNav/><h1>Page not found</h1><p>This page is unavailable.</p><Link href="/">Return to ZUNO</Link></main>;
}

import { Text } from "@/features/language/provider";
import Link from "next/link";
import { BackHomeNav } from "@/components/layout/back-home-nav";
export default function NotFound() {
  return <main className="shell detail-message"><BackHomeNav/><h1><Text>{"Page not found"}</Text></h1><p><Text>{"This page is unavailable."}</Text></p><Link href="/"><Text>{"Return to ZUNO"}</Text></Link></main>;
}

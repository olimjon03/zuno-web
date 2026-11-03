import { Text } from "@/features/language/provider";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
export default function ListingNotFound() {
  return (
    <main className="shell detail-message">
      <Link href="/" className="wordmark">
        <Brand/>
      </Link>
      <BackHomeNav/><h1><Text>{"Listing not found"}</Text></h1>
      <p><Text>{"This listing may have moved, or the link may be incorrect."}</Text></p>
      <Link className="button button-primary" href="/">
        <Text>{"Browse local finds"}</Text></Link>
    </main>
  );
}

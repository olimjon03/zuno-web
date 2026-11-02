import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
export default function ListingNotFound() {
  return (
    <main className="shell detail-message">
      <Link href="/" className="wordmark">
        <Brand/>
      </Link>
      <BackHomeNav/><h1>Listing not found</h1>
      <p>This listing may have moved, or the link may be incorrect.</p>
      <Link className="button button-primary" href="/">
        Browse local finds
      </Link>
    </main>
  );
}

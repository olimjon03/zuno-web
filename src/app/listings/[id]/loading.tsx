import { Text } from "@/features/language/provider";
export default function LoadingListing() {
  return (
    <main className="shell detail-message" role="status">
      <h1><Text>{"Loading your local find…"}</Text></h1>
      <p><Text>{"Getting the listing ready."}</Text></p>
    </main>
  );
}

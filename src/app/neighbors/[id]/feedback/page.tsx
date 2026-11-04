import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Brand } from "@/components/ui/brand";
import { Text } from "@/features/language/provider";
import { isUuid } from "@/features/listings/validation";
import { FeedbackItems } from "@/features/profile/server/feedback-section";
import { getNeighborFeedback, type FeedbackFilter } from "@/features/profile/server/feedback-data";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Feedback | ZUNO", robots: { index: false, follow: false } };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ filter?: string; page?: string }> };

async function Content({ params, searchParams }: Props) {
  await connection();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isUuid(id) || !isSupabaseConfigured()) notFound();
  const filter: FeedbackFilter = query.filter === "positive" || query.filter === "negative" ? query.filter : "all";
  const page = /^\d{1,6}$/.test(query.page ?? "") ? Math.max(1, Number(query.page)) : 1;
  const [{ data, error }, feedback] = await Promise.all([
    createPublicClient().rpc("get_public_profile", { profile_id: id }),
    getNeighborFeedback(id, filter, page),
  ]);
  if (error) throw new Error("Profile could not be loaded");
  if (!data?.[0]) notFound();
  const href = (nextFilter: FeedbackFilter, nextPage: number) => `/neighbors/${id}/feedback?filter=${nextFilter}&page=${nextPage}`;
  return <main className="shell neighbor-page">
    <header className="detail-header"><Link className="wordmark" href="/"><Brand /></Link><BackHomeNav /></header>
    <section className="neighbor-feedback">
      <h1><Text>{"Feedback"}</Text> · <Link href={`/neighbors/${id}`}>{data[0].display_name}</Link></h1>
      <nav className="neighbor-feedback-filters" aria-label="Feedback filters">
        {(["all", "positive", "negative"] as const).map(key => <Link key={key}
          href={href(key, 1)} aria-current={filter === key ? "page" : undefined}
          className={`button ${filter === key ? "button-primary" : "button-outline"}`}>
          <Text>{key === "all" ? "All feedback" : key === "positive" ? "Positive" : "Negative"}</Text>
        </Link>)}
      </nav>
      {feedback ? <>
        <FeedbackItems items={feedback.items.slice(0, 20)} />
        <div className="neighbor-feedback-filters">
          {page > 1 && <Link href={href(filter, page - 1)} className="button button-outline"><Text>{"Previous"}</Text></Link>}
          {feedback.items.length > 20 && <Link href={href(filter, page + 1)} className="button button-outline"><Text>{"Next"}</Text></Link>}
        </div>
      </> : <p><Text>{"Feedback could not be loaded."}</Text></p>}
    </section>
  </main>;
}

export default function Page(props: Props) {
  return <Suspense fallback={null}><Content {...props} /></Suspense>;
}

"use client";
import { useT } from "@/features/language/provider";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
export function BackHomeNav({onBack,onHome,autoFocus = false}: {onBack?: () => void; onHome?: () => void; autoFocus?: boolean} = {}) {
  const t = useT();
  const router = useRouter();
  return <nav className="back-home-nav" aria-label={t("Page navigation")}>
    <button autoFocus={autoFocus} type="button" aria-label={t("Go back")} title={t("Go back")} onClick={() => { if (onBack) { onBack(); return; } if (window.history.length > 1) router.back(); else router.push("/"); }}><Icon name="arrow" className="back-arrow"/></button>
    <Link prefetch={true} href="/" onClick={onHome} aria-label={t("Go to homepage")} title={t("Go to homepage")}><Icon name="home"/></Link>
  </nav>;
}

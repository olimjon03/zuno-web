"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
export function BackHomeNav({onBack,onHome,autoFocus = false}: {onBack?: () => void; onHome?: () => void; autoFocus?: boolean} = {}) {
  const router = useRouter();
  return <nav className="back-home-nav" aria-label="Page navigation">
    <button autoFocus={autoFocus} type="button" aria-label="Go back" title="Go back" onClick={() => { if (onBack) { onBack(); return; } if (window.history.length > 1) router.back(); else router.push("/"); }}><Icon name="arrow" className="back-arrow"/></button>
    <Link prefetch={true} href="/" onClick={onHome} aria-label="Go to homepage" title="Go to homepage"><Icon name="home"/></Link>
  </nav>;
}

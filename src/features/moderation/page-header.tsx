import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { BackHomeNav } from "@/components/layout/back-home-nav";
export function SafetyHeader(){return <header className="detail-header"><Link href="/" className="wordmark" aria-label="ZUNO home"><Brand/></Link><BackHomeNav/></header>;}

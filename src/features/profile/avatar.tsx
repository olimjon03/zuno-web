import Image from "next/image";
import { getSupabaseConfig } from "@/lib/supabase/config";
export function avatarUrl(path: string | null | undefined) {
  return path ? `${getSupabaseConfig().url}/storage/v1/object/public/zuno-avatars/${path}` : null;
}
export function Avatar({ name, path }: { name: string; path?: string | null }) {
  const url = avatarUrl(path);
  return <span className="profile-avatar">{url ? <Image src={url} alt={`${name}’s profile photo`} width={84} height={84} unoptimized/> : Array.from(name)[0]?.toUpperCase() || "N"}</span>;
}

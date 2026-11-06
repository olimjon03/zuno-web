import Link from "next/link";
import { Text } from "@/features/language/provider";
import { Icon } from "@/components/ui/icon";
import { PersonAvatar } from "./person-avatar";
export function ConversationPerson({id,name,avatarPath,neighborhood}:{id:string|null;name:string;avatarPath:string|null;neighborhood:string|null}) {
 if(!id)return <div className="conversation-person"><PersonAvatar name="Deleted account" path={null}/><span><h2><Text>{"Deleted account"}</Text></h2><small><Text>{"This account has been deleted."}</Text></small></span></div>;
 return <Link href={`/neighbors/${id}`} className="conversation-person"><PersonAvatar name={name} path={avatarPath}/><span><h2>{name}</h2><small><Icon name="pin"/>{neighborhood || <Text>{"Your ZUNO neighbor"}</Text>}</small></span></Link>;
}

export type SiteNotification={id:string;kind:string;title:string;body:string;href:string;read_at:string|null;created_at:string};
export type NotificationSnapshot={items:SiteNotification[];unread_count:number};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function notificationHref(value:unknown):string {
 if(typeof value!=="string")return "/account";
 const plain=/^\/(?:account(?:\/(?:listings|safety|settings|saved))?|help(?:#[\w-]+)?)$/;
 const detail=/^\/(?:messages|listings)\/([0-9a-f-]+)$/i;
 const match=value.match(detail);
 return plain.test(value)||(match&&uuid.test(match[1]))?value:"/account";
}
export function parseNotificationSnapshot(value:unknown):NotificationSnapshot {
 if(!value||typeof value!=="object")throw Error("Invalid notification response");
 const raw=value as Record<string,unknown>;
 if(!Array.isArray(raw.items)||!Number.isSafeInteger(raw.unread_count)||Number(raw.unread_count)<0)throw Error("Invalid notification response");
 const items:SiteNotification[]=[];
 for(const candidate of raw.items.slice(0,20)){
  if(!candidate||typeof candidate!=="object")continue;
  const item=candidate as Record<string,unknown>;
  if(typeof item.id!=="string"||!uuid.test(item.id)||typeof item.title!=="string"||!item.title.trim()||item.title.length>120||typeof item.body!=="string"||item.body.length>1000||typeof item.created_at!=="string"||!Number.isFinite(Date.parse(item.created_at))||(item.read_at!==null&&(typeof item.read_at!=="string"||!Number.isFinite(Date.parse(item.read_at)))))continue;
  items.push({id:item.id,kind:typeof item.kind==="string"?item.kind:"announcement",title:item.title,body:item.body,href:notificationHref(item.href),read_at:item.read_at as string|null,created_at:item.created_at});
 }
 return {items,unread_count:Number(raw.unread_count)};
}
export type MessageAlert={id:string;name:string;preview:string;count:number};
export function parseMessageAlerts(value:unknown,counts:Record<string,number>):MessageAlert[]{
 if(!Array.isArray(value))return [];
 return value.flatMap(row=>row&&typeof row==="object"&&typeof row.id==="string"&&uuid.test(row.id)&&Number.isSafeInteger(counts[row.id])&&counts[row.id]>0?[{id:row.id,name:typeof row.other_name==="string"?row.other_name:"Neighbor",preview:typeof row.last_message==="string"?row.last_message:typeof row.listing_title==="string"?row.listing_title:"",count:counts[row.id]}]:[]).slice(0,20);
}

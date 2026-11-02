import { createHash } from "node:crypto";
import { feedParams,type FeedFilters } from "./feed-model";
export class InvalidFeedCursor extends Error {}
type Cursor={v:1;key:string;id:string;createdAt:string;price:number};
function key(filters:FeedFilters){return createHash("sha256").update(feedParams(filters).toString()).digest("hex");}
function validTimestamp(value:unknown):value is string {
 if(typeof value!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/.test(value)||!Number.isFinite(Date.parse(value)))return false;
 const year=Number(value.slice(0,4)),month=Number(value.slice(5,7)),day=Number(value.slice(8,10));
 if(year<1||month<1||month>12||day<1||day>new Date(Date.UTC(year,month,0)).getUTCDate())return false;
 if(Number(value.slice(11,13))>23||Number(value.slice(14,16))>59||Number(value.slice(17,19))>59)return false;
 const offset=value.slice(-6);
 return value.endsWith("Z")||(Number(offset.slice(1,3))<=14&&Number(offset.slice(4))<60&&(Number(offset.slice(1,3))<14||Number(offset.slice(4))===0));
}
export function encodeFeedCursor(row:{id:string;created_at:string;price:number},filters:FeedFilters) {
 return Buffer.from(JSON.stringify({v:1,key:key(filters),id:row.id,createdAt:row.created_at,price:Number(row.price)})).toString("base64url");
}
export function decodeFeedCursor(value:string|undefined,filters:FeedFilters):Cursor|null {
 if(!value)return null;
 try {
  if(value.length>1024||!/^[A-Za-z0-9_-]+$/.test(value))throw Error();
  const cursor=JSON.parse(Buffer.from(value,"base64url").toString("utf8"));
  const validId=typeof cursor.id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cursor.id);
  if(cursor.v!==1||cursor.key!==key(filters)||!validId||!validTimestamp(cursor.createdAt)||!Number.isSafeInteger(cursor.price)||cursor.price<0||cursor.price>1000000000000)throw Error();
  // Preserve PostgreSQL microseconds and timezone; Date.toISOString() loses precision.
  return cursor;
 }catch{throw new InvalidFeedCursor("Results changed. Refresh the search and try again.");}
}

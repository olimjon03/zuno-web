"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/listings/validation";
import { parseReport } from "./validation";
export type SafetyResult = {error?:string;message?:string};
export type SafetyState = {isSelf:boolean;blocked:boolean;canMessage:boolean};
async function authenticated() {
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)throw new Error("Please log in to use safety controls.");
 return db;
}
function unavailable(error:{code?:string}) {return ["PGRST202","42883","42P01"].includes(error.code??"") ? "Safety tools are being prepared. Please try again later." : "Could not save this request. Please try again.";}
export async function readSafetyState(userId:string):Promise<{state?:SafetyState;error?:string}> {
 if(typeof userId!=="string" || !isUuid(userId))return {error:"Invalid user."};
 try {
  const db=await authenticated();const {data,error}=await db.rpc("get_safety_state",{p_user_id:userId});
  if(error)return {error:unavailable(error)};
  const row=data?.[0];if(!row)return {error:"Safety status unavailable."};
  return {state:{isSelf:row.is_self,blocked:row.blocked,canMessage:row.can_message}};
 }catch(error){return {error:error instanceof Error ? error.message : "Could not connect."};}
}
export async function changeBlock(_state:SafetyResult,form:FormData):Promise<SafetyResult> {
 const id=form.get("userId"),intent=form.get("intent");
 if(typeof id!=="string" || !isUuid(id) || !["block","unblock"].includes(String(intent)))return {error:"Choose a valid user and action."};
 if(intent==="block" && form.get("confirm")!=="yes")return {error:"Confirm blocking this user."};
 try {
  const db=await authenticated();const {error}=await db.rpc("set_user_block",{p_user_id:id,p_block:intent==="block"});
  if(error)return {error:unavailable(error)};
 }catch(error){return {error:error instanceof Error ? error.message : "Could not connect."};}
 revalidatePath("/account/safety");revalidatePath("/messages","layout");
 return {message:intent==="block" ? "User blocked. Messaging is now disabled between you." : "User unblocked. Messaging is available unless they have blocked you."};
}
export async function submitReport(_state:SafetyResult,form:FormData):Promise<SafetyResult> {
 const id=form.get("listingId");if(typeof id!=="string" || !isUuid(id))return {error:"Choose a valid listing."};
 let input;try{input=parseReport(form.get("reason"),form.get("details"));}catch(error){return {error:error instanceof Error ? error.message : "Check the report."};}
 try {
  const db=await authenticated();const {error}=await db.rpc("report_listing",{p_listing_id:id,p_reason:input.reason,p_details:input.details});
  if(error)return {error:error.code==="54000" ? "You’ve reached the report limit. Try again later." : error.code==="22023" ? "You can report another user’s visible listing." : unavailable(error)};
 }catch(error){return {error:error instanceof Error ? error.message : "Could not connect."};}
 revalidatePath("/account/safety");revalidatePath("/moderation");
 return {message:"Report received. You can follow its status in Safety & privacy. Duplicate reports are combined."};
}
export async function reviewReport(_state:SafetyResult,form:FormData):Promise<SafetyResult> {
 const id=form.get("reportId"),intent=form.get("intent");
 if(typeof id!=="string" || !isUuid(id) || !["dismiss","remove"].includes(String(intent)))return {error:"Choose a valid review action."};
 if(intent==="remove" && form.get("confirm")!=="yes")return {error:"Confirm hiding this listing."};
 try {
  const db=await authenticated();const {error}=await db.rpc("review_listing_report",{p_report_id:id,p_action:intent});
  if(error)return {error:error.code==="42501" ? "Moderator access required." : error.code==="22023" ? "This report has already been reviewed. Reload the queue." : unavailable(error)};
 }catch{return {error:"Could not save the review. Please try again."};}
 for(const path of ["/moderation","/","/account/safety","/account/listings","/account/saved","/messages"])revalidatePath(path);
 revalidatePath("/listings/[id]","page");revalidatePath("/neighbors/[id]","page");
 return {message:"Review saved."};
}

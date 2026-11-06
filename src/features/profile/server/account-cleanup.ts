import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export class AccountCleanupError extends Error {
  stage: string;
  detail?: {code?:string;status?:number};
  constructor(stage: string, detail?: {code?:string;status?:number}) { super(stage); this.stage=stage; this.detail=detail; }
}
export async function cleanupAccount(admin:SupabaseClient,userId:string):Promise<"deleted"|"pending"|"admin_account"> {
  const {data:ready,error:startError}=await admin.rpc("prepare_account_deletion",{p_user_id:userId});
  if(startError)throw new AccountCleanupError("prepare",startError);
  if(ready==="admin_account")return "admin_account";
  if(ready!=="ready")throw new AccountCleanupError("prepare");
  const bucket=admin.storage.from("zuno-message-files");
  const {data:archives,error:archiveError}=await admin.rpc("get_account_chat_archive_batch",{p_user_id:userId});
  if(archiveError||!Array.isArray(archives))throw new AccountCleanupError("archive_lookup",archiveError??undefined);
  for(const file of archives as {attachment_id:string;source_path:string;destination_path:string}[]) {
    // Reserved /retained/ paths cannot be uploaded by ordinary clients. Deterministic
    // paths allow recovery after a copy/commit response is lost without overwriting.
    // HEAD/exists can lose the structured 404 body and surface as HTTP 400.
    // GET info preserves NoSuchKey/statusCode so genuine auth/network failures
    // are never mistaken for an absent archive.
    const {data:info,error:infoError}=await bucket.info(file.destination_path);
    const missing=infoError && (("code" in infoError && infoError.code==="NoSuchKey") ||
      ("statusCode" in infoError && String(infoError.statusCode)==="404"));
    if(infoError&&!missing)throw new AccountCleanupError("archive_check",infoError);
    if(!info) {
      const {error}=await bucket.copy(file.source_path,file.destination_path,{copyMetadata:false});
      if(error)throw new AccountCleanupError("archive_copy",error);
    }
    const {error}=await admin.rpc("commit_account_chat_archive",{p_user_id:userId,p_attachment_id:file.attachment_id,p_source_path:file.source_path,p_destination_path:file.destination_path});
    if(error)throw new AccountCleanupError("archive_commit",error);
  }
  const {data:remaining,error:remainingError}=await admin.rpc("get_account_chat_archive_batch",{p_user_id:userId});
  if(remainingError||!Array.isArray(remaining))throw new AccountCleanupError("archive_lookup",remainingError??undefined);
  if(remaining.length)return "pending";
  let previous="";
  // Bound each action; a retry continues an account already marked as deleting.
  for(let batch=0;batch<5;batch++) {
    const {data,error}=await admin.rpc("get_account_storage_batch",{p_user_id:userId});
    if(error||!Array.isArray(data))throw new AccountCleanupError("storage_lookup",error??undefined);
    if(!data.length) {
      const {error:authError}=await admin.auth.admin.deleteUser(userId);
      if(authError&&authError.code!=="user_not_found")throw new AccountCleanupError("auth_delete",authError);
      return "deleted";
    }
    const fingerprint=JSON.stringify(data);
    if(fingerprint===previous)throw new AccountCleanupError("storage_stalled");
    previous=fingerprint;
    const groups=new Map<string,string[]>();
    for(const file of data as {bucket_id:string;name:string}[])groups.set(file.bucket_id,[...(groups.get(file.bucket_id)??[]),file.name]);
    for(const [name,paths] of groups) {
      const {error}=await admin.storage.from(name).remove(paths);
      if(error)throw new AccountCleanupError("storage_remove",error);
    }
  }
  return "pending";
}

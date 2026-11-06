// Real Auth/Postgres/Storage regression. Refuses every non-loopback endpoint.
// Run only against an isolated Supabase CLI stack with Web migrations applied.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import '../tests/helpers/register-runtime.mjs';
const { cleanupAccount } = await import('../src/features/profile/server/account-cleanup.ts');
const statusPath=process.argv[2];
if(!statusPath)throw Error('Pass the local Supabase status JSON file; environment keys are never used.');
const status=JSON.parse(readFileSync(statusPath,'utf8'));
const url=status.API_URL ?? status.api_url;
const endpoint=new URL(url);
if(endpoint.protocol!=='http:' || !['127.0.0.1','localhost','[::1]'].includes(endpoint.hostname) || endpoint.port!=='54321')
 throw Error('Refusing non-local test endpoint. Expected http://127.0.0.1:54321.');
const secret=status.SERVICE_ROLE_KEY ?? status.service_role_key;
const publishable=status.ANON_KEY ?? status.anon_key;
if(!secret||!publishable)throw Error('Missing keys in local status JSON. Do not supply production credentials.');
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(url,secret,options);
const fixtures=[];
function check(result,stage){if(result.error)throw Error(`${stage}: ${result.error.code??result.error.status??'failed'} ${result.error.message??''}`);return result.data;}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function account(label){
 const email=`local-retention-${randomUUID()}@example.invalid`,password=`Local-${randomUUID()}-aA1!`;
 const data=check(await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:label}}),'create local account');
 fixtures.push(data.user.id);
 const db=createClient(url,publishable,options);
 check(await db.auth.signInWithPassword({email,password}),'sign in local account');
 return {id:data.user.id,db};
}
async function finish(id){for(let i=0;i<20;i++){const result=await cleanupAccount(admin,id);if(result==='deleted')return;if(result!=='pending')throw Error(`Unexpected cleanup state ${result}`);}throw Error('Cleanup failed to converge');}
async function exists(bucket,path){
 const {data,error}=await admin.storage.from(bucket).info(path);
 if(error&&error.code!=='NoSuchKey'&&error.statusCode!=='404')throw Error(`Storage lookup failed: ${error.statusCode??error.status}`);
 return Boolean(data);
}
function localSql(sql){
 const result=spawnSync('docker',['exec','-i','supabase_db_zuno-retention-local','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8'});
 if(result.status!==0)throw Error('Local fixture SQL failed: '+result.stderr);
}
let protectedId=null;
const files=[];
try {
 const seller=await account('Local seller'),buyer=await account('Local buyer'),stranger=await account('Local stranger');
 const category=check(await admin.from('categories').select('id').limit(1).single(),'category');
 const area=check(await admin.from('neighborhoods').select('id').limit(1).single(),'neighborhood');
 const listing=randomUUID();
 check(await admin.from('listings').insert({id:listing,seller_id:seller.id,category_id:category.id,neighborhood_id:area.id,title:'Local retention fixture',description:'Temporary local retention test listing',price:100,condition:'good',seller_name:'Local seller'}),'create listing');
 const conversation=check(await buyer.db.rpc('start_conversation',{p_listing_id:listing}),'start conversation');
 for(const [db,body] of [[seller.db,'Seller message to retain'],[buyer.db,'Buyer reply to retain']])
  check(await db.rpc('send_message',{p_conversation_id:conversation,p_client_id:randomUUID(),p_body:body}),'send text');
 // A real WebP and a real PDF are uploaded using the regular user's Storage API.
 const sharp=(await import('sharp')).default;
 const photo=await sharp({create:{width:32,height:32,channels:3,background:'#008577'}}).webp().toBuffer();
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n');
 const attachments=[];
 for(const [name,mime,bytes] of [['fixture.webp','image/webp',photo],['fixture.pdf','application/pdf',pdf]]){
  const id=randomUUID(),path=`${seller.id}/${conversation}/${id}`;
  check(await seller.db.storage.from('zuno-message-files').upload(path,bytes,{contentType:mime}),'upload shared file');
  attachments.push({id,storage_path:path,name,mime,size:bytes.length});files.push({id,path,hash:hash(bytes)});
 }
 check(await seller.db.rpc('send_message_attachments',{p_conversation_id:conversation,p_client_id:randomUUID(),p_body:'Shared photo and PDF',p_attachments:attachments}),'commit shared attachments');
 // Private profile/listing assets must disappear, unlike committed shared files.
 const avatar=`${seller.id}/${randomUUID()}.webp`;
 check(await seller.db.storage.from('zuno-avatars').upload(avatar,photo,{contentType:'image/webp'}),'upload private avatar');
 check(await seller.db.from('profiles').update({avatar_path:avatar}).eq('id',seller.id),'set private avatar');
 const before=check(await buyer.db.from('messages').select('id,body').eq('conversation_id',conversation),'read before');
 assert.equal(before.length,3);
 for(const file of files){
  const blob=check(await buyer.db.storage.from('zuno-message-files').download(file.path),'survivor read before');
  assert.equal(hash(Buffer.from(await blob.arrayBuffer())),file.hash);
  assert.ok((await stranger.db.storage.from('zuno-message-files').download(file.path)).error,'Stranger read original file');
 }
 await finish(seller.id);
 assert.ok((await admin.auth.admin.getUserById(seller.id)).error,'Auth user remains');
 assert.equal(check(await admin.from('profiles').select('id').eq('id',seller.id),'profile after').length,0);
 assert.equal(check(await admin.from('listings').select('id').eq('id',listing),'listing after').length,0);
 assert.equal(await exists('zuno-avatars',avatar),false);
 const inbox=check(await buyer.db.rpc('get_inbox'),'survivor inbox');
 const entry=inbox.find(row=>row.id===conversation);
 assert.equal(entry?.other_id,null);assert.equal(entry?.other_name,'Deleted account');assert.equal(entry?.avatar_path,null);assert.equal(entry?.neighborhood,null);
 const messages=check(await buyer.db.from('messages').select('id,sender_id,body').eq('conversation_id',conversation),'survivor history');
 assert.equal(messages.length,3);assert.ok(messages.some(row=>row.body==='Seller message to retain'&&row.sender_id===null));
 assert.equal(check(await stranger.db.from('messages').select('id').eq('conversation_id',conversation),'stranger history').length,0);
 assert.ok((await buyer.db.rpc('send_message',{p_conversation_id:conversation,p_client_id:randomUUID(),p_body:'Must not send'})).error,'Closed chat accepted message');
 const archived=check(await admin.from('message_attachments').select('id,storage_path').in('id',files.map(f=>f.id)),'archive references');
 for(const file of files){
  const target=archived.find(a=>a.id===file.id)?.storage_path;
  assert.equal(target,`${buyer.id}/${conversation}/retained/${file.id}`);
  const blob=check(await buyer.db.storage.from('zuno-message-files').download(target),'survivor read archived');
  assert.equal(hash(Buffer.from(await blob.arrayBuffer())),file.hash,'Archived bytes differ');
  assert.ok((await stranger.db.storage.from('zuno-message-files').download(target)).error,'Stranger read archive');
  assert.equal(await exists('zuno-message-files',file.path),false,'Original remains');
 }
 console.log('PASS real local Storage: WebP/PDF bytes preserved, originals/avatar removed, Auth/profile/listings deleted, history anonymized, stranger denied, chat read-only.');
 await finish(buyer.id);
 assert.equal(check(await admin.from('conversations').select('id').eq('id',conversation),'final conversation').length,0);
 for(const row of archived)assert.equal(await exists('zuno-message-files',row.storage_path),false,'Archived file remains after both accounts deleted');
 console.log('PASS real local Storage: final participant deletion removes conversation and archived files.');
 await finish(stranger.id);
 // Real retry/chunk test: a copy exists but an invalid commit was rejected.
 const retrySender=await account('Local retry sender'),retryReceiver=await account('Local retry receiver');
 const retryConversation=randomUUID(),retryFiles=[];
 check(await admin.from('conversations').insert({id:retryConversation,listing_title:'Local retry fixture',buyer_id:retryReceiver.id,seller_id:retrySender.id,buyer_name:'Local retry receiver',seller_name:'Local retry sender'}),'create retry conversation');
 for(let message=0;message<3;message++){
  const batch=[];
  for(let f=0;f<4;f++){
   const id=randomUUID(),path=`${retrySender.id}/${retryConversation}/${id}`,bytes=Buffer.from(`retry-content-${message}-${f}`);
   check(await retrySender.db.storage.from('zuno-message-files').upload(path,bytes,{contentType:'text/plain'}),'upload retry file');
   batch.push({id,storage_path:path,name:`retry-${message}-${f}.txt`,mime:'text/plain',size:bytes.length});retryFiles.push({id,path,hash:hash(bytes)});
  }
  check(await retrySender.db.rpc('send_message_attachments',{p_conversation_id:retryConversation,p_client_id:randomUUID(),p_body:`Retry message ${message}`,p_attachments:batch}),'commit retry message');
 }
 check(await admin.rpc('prepare_account_deletion',{p_user_id:retrySender.id}),'prepare retry');
 const manifest=check(await admin.rpc('get_account_chat_archive_batch',{p_user_id:retrySender.id}),'retry archive manifest');
 const first=manifest[0];
 check(await admin.storage.from('zuno-message-files').copy(first.source_path,first.destination_path,{copyMetadata:false}),'precopy before lost commit');
 assert.ok((await admin.rpc('commit_account_chat_archive',{p_user_id:retrySender.id,p_attachment_id:first.attachment_id,p_source_path:first.source_path,p_destination_path:'wrong-destination'})).error,'Invalid destination accepted');
 assert.equal(check(await admin.from('message_attachments').select('storage_path').eq('id',first.attachment_id).single(),'uncommitted reference').storage_path,first.source_path);
 assert.equal(await cleanupAccount(admin,retrySender.id),'pending','Large account should need another chunk');
 assert.ok(check(await admin.auth.admin.getUserById(retrySender.id),'pending user').user,'Auth deleted before archive completion');
 assert.equal(await exists('zuno-message-files',first.source_path),true,'Pending archive removed source early');
 await finish(retrySender.id);
 for(const file of retryFiles){
  const destination=`${retryReceiver.id}/${retryConversation}/retained/${file.id}`;
  const blob=check(await retryReceiver.db.storage.from('zuno-message-files').download(destination),'retry archived bytes');
  assert.equal(hash(Buffer.from(await blob.arrayBuffer())),file.hash);
 }
 assert.equal(check(await retryReceiver.db.from('messages').select('id').eq('conversation_id',retryConversation),'retry history').length,3);
 await finish(retryReceiver.id);
 console.log('PASS real local retry: reserved existing copy reused, invalid commit rejected, 12-file bounded cleanup resumed without early Auth/source deletion.');
 // A disposable LOCAL admin fixture must not be deleted or lose its avatar.
 const protectedUser=await account('Local protected admin');protectedId=protectedUser.id;
 localSql(`create schema if not exists zuno_admin;create table if not exists zuno_admin.staff_memberships(user_id uuid primary key references auth.users(id) on delete restrict);insert into zuno_admin.staff_memberships(user_id) values('${protectedId}');`);
 const protectedAvatar=`${protectedId}/${randomUUID()}.webp`;
 check(await protectedUser.db.storage.from('zuno-avatars').upload(protectedAvatar,photo,{contentType:'image/webp'}),'upload admin fixture avatar');
 assert.equal(await cleanupAccount(admin,protectedId),'admin_account');
 assert.ok(check(await admin.auth.admin.getUserById(protectedId),'protected admin still exists').user);
 assert.equal(check(await admin.from('profiles').select('deleting_at').eq('id',protectedId).single(),'protected admin state').deleting_at,null);
 assert.equal(await exists('zuno-avatars',protectedAvatar),true,'Admin avatar was removed');
 console.log('PASS real local admin safety: membership blocks deletion before any avatar/account cleanup.');

} finally {
 // Remove only this run's disposable LOCAL membership before fixture teardown.
 if(protectedId)localSql(`delete from zuno_admin.staff_memberships where user_id='${protectedId}';`);
 // Only IDs created by this run are eligible for best-effort cleanup.
 for(const id of fixtures){const {data}=await admin.auth.admin.getUserById(id);if(data?.user)try{await finish(id);}catch{console.error('Local fixture cleanup pending; reset the isolated stack before rerunning.');}}
}

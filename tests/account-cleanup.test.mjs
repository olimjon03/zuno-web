import {test} from 'node:test';
import assert from 'node:assert/strict';
import './helpers/register-runtime.mjs';
const {cleanupAccount,AccountCleanupError}=await import('../src/features/profile/server/account-cleanup.ts');
function fixture({adminAccount=false,fail,copyExists=false,moreArchives=false}={}) {
 const events=[];let archived=false,removed=false;
 const file={attachment_id:'file-id',source_path:'old-path',destination_path:'recipient/conversation/retained/file'};
 const bucket={
  exists:async()=>({data:copyExists,error:null}),
  copy:async()=>{events.push('copy');return {error:fail==='copy'?{code:'storage_error'}:null};},
  remove:async paths=>{events.push('remove');if(fail==='remove')return {error:{code:'storage_error'}};assert.deepEqual(paths,['old-path']);removed=true;return {error:null};},
 };
 const client={storage:{from:()=>bucket},auth:{admin:{deleteUser:async()=>{events.push('delete');return {error:null};}}},rpc:async name=>{
  events.push(name);
  if(name==='prepare_account_deletion')return {data:adminAccount?'admin_account':'ready',error:fail==='prepare'?{code:'PGRST202'}:null};
  if(name==='get_account_chat_archive_batch')return {data:archived&&!moreArchives?[]:[file],error:null};
  if(name==='commit_account_chat_archive'){archived=true;return {error:fail==='commit'?{code:'22023'}:null};}
  if(name==='get_account_storage_batch')return {data:removed?[]:[{bucket_id:'zuno-message-files',name:'old-path'}],error:null};
  throw Error(name);
 }};
 return {client,events};
}
test('deletion copies and commits shared files before removing originals and deleting Auth identity',async()=>{
 const {client,events}=fixture();assert.equal(await cleanupAccount(client,'user'),'deleted');
 assert.ok(events.indexOf('copy')<events.indexOf('commit_account_chat_archive'));
 assert.ok(events.indexOf('commit_account_chat_archive')<events.indexOf('remove'));
 assert.ok(events.indexOf('remove')<events.indexOf('delete'));
});
test('retry reuses a reserved archive copy and skips copying it again',async()=>{
 const {client,events}=fixture({copyExists:true});assert.equal(await cleanupAccount(client,'user'),'deleted');assert.ok(!events.includes('copy'));
});
test('missing migration, copy, commit and cleanup errors never delete Auth identity',async()=>{
 for(const fail of ['prepare','copy','commit','remove']){
  const {client,events}=fixture({fail});await assert.rejects(cleanupAccount(client,'user'),AccountCleanupError);
  assert.ok(!events.includes('delete'));
  if(fail!=='remove')assert.ok(!events.includes('remove'));
 }
});
test('admin restriction and pending archive batches return before destructive cleanup',async()=>{
 for(const options of [{adminAccount:true},{moreArchives:true}]){
  const {client,events}=fixture(options);assert.equal(await cleanupAccount(client,'user'),options.adminAccount?'admin_account':'pending');
  assert.ok(!events.includes('remove'));assert.ok(!events.includes('delete'));
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
const user='22222222-2222-4222-8222-222222222222', conversation='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', client='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let cleanupLookups=0;
let signed=true, committed=false, lost=false, blocked=false, uploads=0, rpcCalls=0, linked=[], removed=[], stored=new Map();
const db={auth:{getUser:async()=>({data:{user:signed?{id:user}:null},error:null})},from(table){
 const filters={};const q={select(){return q;},eq(key,value){filters[key]=value;return q;},in(key,values){filters[key]=values;return q;},limit:async()=>({data:[],error:null}),
 maybeSingle:async()=>({data:table==='conversations'?{buyer_id:user,seller_id:client}:table==='messages'?(committed?{id:7}:null):linked.find(file=>file.id===filters.id)||null,error:null}),
 then(resolve){cleanupLookups++;const data=linked.filter(file=>!filters.storage_path||filters.storage_path.includes(file.storage_path));return Promise.resolve({data,error:null}).then(resolve);}};return q;},
 storage:{from(){return {upload:async(path,bytes)=>{uploads++;stored.set(path,bytes);return {error:null};},remove:async(paths)=>{removed.push(...paths);for(const path of paths)stored.delete(path);return {error:null};},download:async(path)=>({data:stored.has(path)?new Blob([stored.get(path)]):null,error:null})};}},
 rpc:async(_name,input)=>{if(_name==='take_upload_request_quota')return {data:true,error:null};rpcCalls++;if(blocked)return {error:{code:'P0002'}};committed=true;linked=input.p_attachments.map(file=>({...file,message_id:7}));return lost?{error:{code:'FETCH_ERROR'}}:{data:7,error:null};}
};
globalThis.__mediaDb=db;
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__mediaDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSiteUrl=()=>"https://zuno.example"',shortCircuit:true};
 if(specifier==='next/server')return next('next/server.js',context);
 if(specifier.startsWith('@/features/'))return next(new URL('../src/'+specifier.slice(2)+'.ts',import.meta.url).href,context);
 return next(specifier,context);
}});
const {sendAttachments,readAttachment}=await import('../src/features/messages/server/media.ts');
function request(){const body=new FormData();body.set('conversationId',conversation);body.set('clientId',client);body.set('body','');body.append('files',new File(['hello'],'details.txt',{type:'text/plain'}));return new Request('https://zuno.example/api/messages/attachments',{method:'POST',headers:{Origin:'https://zuno.example'},body});}
function reset(){cleanupLookups=0;signed=true;committed=false;lost=false;blocked=false;uploads=0;rpcCalls=0;linked=[];removed=[];stored=new Map();}
test('lost commit response retains attached objects and retry confirms without duplicate upload',async()=>{
 reset();lost=true;
 assert.equal((await sendAttachments(request())).status,503);
 assert.equal(linked.length,1);assert.equal(stored.size,1);assert.deepEqual(removed,[]);assert.equal(cleanupLookups,0);
 lost=false;assert.equal((await sendAttachments(request())).status,200);
 assert.equal(uploads,1);assert.equal(rpcCalls,1);assert.equal(linked.length,1);
 const response=await readAttachment(new Request('https://zuno.example/file'),linked[0].id);
 assert.equal(response.status,200);assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 assert.match(response.headers.get('content-disposition'),/^attachment;/);assert.match(response.headers.get('cache-control'),/no-store/);
});
test('blocked sends clean only unlinked uploads; anonymous and wrong-origin requests are denied',async()=>{
 reset();blocked=true;const response=await sendAttachments(request());
 assert.equal(response.status,503);assert.match((await response.json()).error,/Messaging is unavailable/);
 assert.equal(removed.length,1);assert.equal(stored.size,0);assert.equal(linked.length,0);
 reset();signed=false;assert.equal((await sendAttachments(request())).status,401);assert.equal(uploads,0);
 assert.equal((await readAttachment(new Request('https://zuno.example/file'),client)).status,401);
 signed=true;assert.equal((await readAttachment(new Request('https://zuno.example/file'),client)).status,404);
 assert.equal((await sendAttachments(new Request('https://zuno.example/api/messages/attachments',{method:'POST',headers:{Origin:'https://wrong.example'}}))).status,403);
});

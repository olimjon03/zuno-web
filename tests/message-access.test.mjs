import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import './helpers/register-runtime.mjs';
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const actor='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let authenticated=true, conversation, calls=[], rpcError=null;
const db={auth:{getUser:async()=>({data:{user:authenticated?{id:actor}:null},error:null})},
 rpc:async(name)=>{calls.push(name);return {data:null,error:rpcError};},
 from(table){calls.push(table);const q={select(){return q;},eq(){return q;},lt(){calls.push('older');return q;},gt(){calls.push('newer');return q;},maybeSingle:async()=>({data:conversation,error:null}),order(_field,{ascending}){calls.push(ascending?'asc':'desc');return q;},limit:async()=>({data:[{id:2},{id:1}],error:null})};return q;}};
globalThis.__messageTestDb=db;
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__messageTestDb',shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export const redirect=(url)=>{throw Error(url)}',shortCircuit:true};
 if(specifier==='@/features/listings/validation')return next(new URL('../src/features/listings/validation.ts',import.meta.url).href,context);
 return next(specifier,context);
}});
const {readMessages,postMessage}=await import('../src/features/messages/server/actions.ts');
const {markMessagesRead}=await import('../src/features/messages/server/unread-actions.ts');
test('message actions validate callers and deny nonparticipants before fetching history',async()=>{
 calls=[];authenticated=false;
 assert.match((await readMessages(id)).error,/log in/);
 assert.match((await postMessage(id,id,'Hello')).error,/log in/);
 assert.match((await markMessagesRead(id,1)).error,/log in/);
 assert.deepEqual(calls,[]);
 authenticated=true;conversation={id,buyer_id:id,seller_id:id};
 assert.match((await readMessages(id)).error,/unavailable/);
 assert.deepEqual(calls,['conversations']);
 calls=[];assert.match((await readMessages('invalid')).error,/Invalid/);
 assert.match((await markMessagesRead(id,NaN)).error,/Invalid/);
 assert.deepEqual(calls,[]);
});
test('participant history uses bounded cursor direction and blocked sends preserve errors',async()=>{
 calls=[];conversation={id,buyer_id:actor,seller_id:id};
 assert.deepEqual((await readMessages(id)).messages.map(m=>m.id),[1,2]);
 assert.ok(calls.includes('desc'));calls=[];
 await readMessages(id,2);assert.ok(calls.includes('newer'));assert.ok(calls.includes('asc'));
 calls=[];await readMessages(id,2,true);assert.ok(calls.includes('older'));assert.ok(calls.includes('desc'));
 rpcError={code:'P0002'};assert.match((await postMessage(id,id,'Hello')).error,/draft has been kept/);
 rpcError=null;assert.deepEqual(await postMessage(id,id,'Hello'),{ok:true});
 assert.deepEqual(await markMessagesRead(id,2),{ok:true});
});

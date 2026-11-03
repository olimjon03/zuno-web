import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', visitor='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let calls=[], unavailable=false;
globalThis.__engagementDb={rpc(name,args){calls.push({name,args});return Promise.resolve({data:name==='get_listing_engagement'?[{listing_id:id,view_count:'123',messager_count:'4'}]:null,error:unavailable?{code:'PGRST202'}:null});}};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/public')return {url:'data:text/javascript,export const createPublicClient=()=>globalThis.__engagementDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__engagementDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSiteUrl=()=>"https://zuno.example"',shortCircuit:true};
 if(specifier==='next/server')return next('next/server.js',context);
 return next(specifier,context);
}});
const {withListingEngagement}=await import('../src/features/listings/server/engagement.ts');
const {recordListingView}=await import('../src/features/listings/server/record-view.ts');
const {NextRequest}=await import('next/server.js');
test('card counts use one batch RPC and missing metrics do not fabricate zeros or break cards',async()=>{
 const items=[{id,title:'Item'},{id:'sample',title:'Demo'}];
 const result=await withListingEngagement(items);assert.deepEqual(result[0].engagement,{views:123,messagers:4});assert.equal(result[1].engagement,undefined);
 assert.equal(calls.length,1);assert.deepEqual(calls[0].args,{p_listing_ids:[id]});assert.equal(items[0].engagement,undefined);
 calls=[];await withListingEngagement([items[1]]);assert.equal(calls.length,0);
 unavailable=true;assert.deepEqual(await withListingEngagement(items),items);unavailable=false;
});
test('view endpoint requires same-origin POST context and reuses an HttpOnly daily visitor cookie',async()=>{
 calls=[];let response=await recordListingView(new NextRequest('https://zuno.example/api/view',{method:'POST',headers:{Origin:'https://wrong.example'}}),id);assert.equal(response.status,403);assert.equal(calls.length,0);
 response=await recordListingView(new NextRequest('https://zuno.example/api/view',{method:'POST',headers:{Origin:'https://zuno.example',Cookie:`zuno_listing_viewer=${visitor}`}}),id);assert.equal(response.status,204);assert.equal(calls.at(-1).args.p_visitor_id,visitor);assert.equal(response.headers.get('set-cookie'),null);
 response=await recordListingView(new NextRequest('https://zuno.example/api/view',{method:'POST',headers:{Origin:'https://zuno.example'}}),id);assert.match(response.headers.get('set-cookie'),/HttpOnly/);assert.match(response.headers.get('set-cookie'),/SameSite=lax/);assert.match(response.headers.get('cache-control'),/no-store/);
 unavailable=true;response=await recordListingView(new NextRequest('https://zuno.example/api/view',{method:'POST',headers:{Origin:'https://zuno.example'}}),id);assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);unavailable=false;
});

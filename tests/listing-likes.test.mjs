import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
let signed=true, calls=[], failure=null, malformed=false;
globalThis.__likesDb={auth:{getUser:async()=>({data:{user:signed?{id:'verified-user'}:null},error:null})},rpc:async(name,args)=>{calls.push({name,args});return {data:malformed?[{liked:args.p_liked,like_count:-1}]:[{liked:args.p_liked,like_count:args.p_liked?'7':'6'}],error:failure};}};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__likesDb',shortCircuit:true};
 if(specifier==='@/features/listings/validation')return next(new URL('../src/features/listings/validation.ts',import.meta.url).href,context);
 return next(specifier,context);
}});
const {setListingLike}=await import('../src/features/likes/server/actions.ts');
test('like action rejects invalid input and anonymous callers without mutating',async()=>{
 calls=[];assert.ok((await setListingLike('sample',true)).error);assert.ok((await setListingLike(id,'true')).error);assert.equal(calls.length,0);
 signed=false;assert.equal((await setListingLike(id,true)).login,true);assert.equal(calls.length,0);signed=true;
});
test('like action sends an idempotent desired state without accepting a user identity',async()=>{
 calls=[];assert.deepEqual(await setListingLike(id,true),{liked:true,count:7});assert.deepEqual(calls[0],{name:'set_listing_like',args:{p_listing_id:id,p_liked:true}});
 assert.deepEqual(await setListingLike(id,false),{liked:false,count:6});
});
test('like action rejects missing migrations, removed listings and malformed counts',async()=>{
 failure={code:'PGRST202'};assert.ok((await setListingLike(id,true)).error);
 failure={code:'P0002'};assert.match((await setListingLike(id,true)).error,/no longer/);
 failure=null;malformed=true;assert.ok((await setListingLike(id,true)).error);malformed=false;
});

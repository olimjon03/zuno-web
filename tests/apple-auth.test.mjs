import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
let input, response, fail=false;
globalThis.__appleDb={auth:{signInWithOAuth:async args=>{input=args;if(fail)throw Error('private provider details');return response;}}};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__appleDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSiteUrl=()=>"https://zuno.example";export const getSupabaseConfig=()=>({url:"https://project.supabase.co"})',shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export const redirect=url=>{throw Error("REDIRECT "+url)}',shortCircuit:true};
 return next(specifier,context);
}});
const {loginWithApple}=await import('../src/features/auth/apple-action.ts');
test('Apple OAuth uses the trusted callback and only redirects to its Supabase authorization endpoint',async()=>{
 response={data:{url:'https://project.supabase.co/auth/v1/authorize?provider=apple'},error:null};
 await assert.rejects(loginWithApple(),/REDIRECT https:\/\/project.supabase.co\/auth\/v1\/authorize/);
 assert.deepEqual(input,{provider:'apple',options:{redirectTo:'https://zuno.example/auth/callback',skipBrowserRedirect:true}});
 for(const url of ['https://bad.example/auth/v1/authorize?provider=apple','https://project.supabase.co/other?provider=apple','https://project.supabase.co/auth/v1/authorize?provider=google']){
  response={data:{url},error:null};assert.ok((await loginWithApple()).error);
 }
});
test('Apple startup failures return a retry message without disclosing provider errors',async()=>{
 response={data:{url:null},error:{message:'private provider details'}};
 assert.match((await loginWithApple()).error,/unavailable/);
 fail=true;const old=console.error;console.error=()=>{};
 try{assert.doesNotMatch((await loginWithApple()).error,/private provider details/);}finally{console.error=old;fail=false;}
});

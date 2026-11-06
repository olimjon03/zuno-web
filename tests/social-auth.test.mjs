import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
let input,response,fail=false;
globalThis.__socialDb={auth:{signInWithOAuth:async args=>{input=args;if(fail)throw Error('private provider details');return response;}}};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__socialDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSiteUrl=()=>"https://zuno.example";export const getSupabaseConfig=()=>({url:"https://project.supabase.co"})',shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export const redirect=url=>{throw Error("REDIRECT "+url)}',shortCircuit:true};
 return next(specifier,context);
}});
const {loginWithKakao,loginWithTelegram}=await import('../src/features/auth/social-actions.ts');
for(const [provider,action] of [['kakao',loginWithKakao],['custom:telegram',loginWithTelegram]]){
 test(`${provider} uses trusted callback and restricts authorization destinations`,async()=>{
  response={data:{url:`https://project.supabase.co/auth/v1/authorize?provider=${encodeURIComponent(provider)}`},error:null};
  await assert.rejects(action(),/REDIRECT https:\/\/project.supabase.co\/auth\/v1\/authorize/);
  assert.deepEqual(input,{provider,options:{redirectTo:'https://zuno.example/auth/callback',skipBrowserRedirect:true}});
  for(const url of [`https://bad.example/auth/v1/authorize?provider=${provider}`,`https://project.supabase.co/other?provider=${provider}`,'https://project.supabase.co/auth/v1/authorize?provider=google']){
   response={data:{url},error:null};assert.ok((await action()).error);
  }
 });
 test(`${provider} handles provider errors without revealing private details`,async()=>{
  response={data:{url:null},error:{message:'private provider details'}};
  assert.doesNotMatch((await action()).error,/private provider details/);
  fail=true;const old=console.error;console.error=()=>{};
  try{assert.match((await action()).error,/try again/i);}finally{console.error=old;fail=false;}
 });
}

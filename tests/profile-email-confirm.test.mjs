import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
let calls=[];
globalThis.__confirmDb={auth:{verifyOtp:async input=>{calls.push(input);return {error:null};}}};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/features/onboarding/server/preference')return {url:'data:text/javascript,export const clearCountryPreference=async()=>{}',shortCircuit:true};
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__confirmDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSiteUrl=()=>"https://zuno.example"',shortCircuit:true};
 if(specifier==='next/cache')return {url:'data:text/javascript,export const revalidatePath=()=>{}',shortCircuit:true};
 if(specifier==='next/server')return next('next/server.js',context);
 return next(specifier,context);
}});
const {GET}=await import('../src/app/auth/confirm/route.ts');
const {NextRequest}=await import('next/server.js');
test('email-change confirmation uses the correct OTP type and fixed settings redirect',async()=>{
 const response=await GET(new NextRequest('https://zuno.example/auth/confirm?type=email_change&token_hash=fixture-token'));
 assert.equal(calls[0].type,'email_change');assert.equal(response.headers.get('location'),'https://zuno.example/account/settings');
 const signup=await GET(new NextRequest('https://zuno.example/auth/confirm?type=email&token_hash=fixture-token'));
 assert.equal(calls[1].type,'email');assert.equal(signup.headers.get('location'),'https://zuno.example/welcome');
 calls=[];await GET(new NextRequest('https://zuno.example/auth/confirm?type=recovery&token_hash=fixture-token'));assert.deepEqual(calls,[]);
});

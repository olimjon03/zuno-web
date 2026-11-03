import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import './helpers/register-runtime.mjs';
let cleared=0,fail=false;
globalThis.__authCountryDb={auth:{signInWithPassword:async()=>({error:fail?{code:'invalid_credentials'}:null}),signUp:async()=>({data:{session:{}},error:null}),exchangeCodeForSession:async()=>({error:fail?{}:null})}};
globalThis.__clearCountry=()=>{cleared++;};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__authCountryDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const isSupabaseConfigured=()=>true;export const getSiteUrl=()=>"https://zuno.example"',shortCircuit:true};
 if(specifier==='@/features/onboarding/server/preference')return {url:'data:text/javascript,export const clearCountryPreference=async()=>globalThis.__clearCountry()',shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export const redirect=url=>{throw Error("REDIRECT "+url)}',shortCircuit:true};
 if(specifier==='next/cache')return {url:'data:text/javascript,export const revalidatePath=()=>{}',shortCircuit:true};
 if(specifier==='next/server')return next('next/server.js',context);
 return next(specifier,context);
}});
const {login,signup}=await import('../src/features/auth/actions.ts');
const {GET}=await import('../src/app/auth/callback/route.ts');
const {NextRequest}=await import('next/server.js');
function form(){const f=new FormData();f.set('email','neighbor@example.invalid');f.set('password','long-password');f.set('displayName','Neighbor');return f;}
test('password login clears prior confirmation only on success and requires welcome confirmation',async()=>{
 fail=true;assert.ok((await login({},form())).error);assert.equal(cleared,0);
 fail=false;await assert.rejects(login({},form()),/REDIRECT \/welcome/);assert.equal(cleared,1);
 await assert.rejects(signup({},form()),/REDIRECT \/welcome/);assert.equal(cleared,2);
});
test('successful OAuth callback clears country confirmation and uses the fixed welcome URL',async()=>{
 const before=cleared;
 const ok=await GET(new NextRequest('https://zuno.example/auth/callback?code=qa-code&next=https://bad.example'));
 assert.equal(ok.headers.get('location'),'https://zuno.example/welcome');assert.equal(cleared,before+1);
 fail=true;const bad=await GET(new NextRequest('https://zuno.example/auth/callback?code=qa-code'));
 assert.equal(bad.headers.get('location'),'https://zuno.example/login?notice=signin');assert.equal(cleared,before+1);fail=false;
});

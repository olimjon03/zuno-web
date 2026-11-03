import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
let signed=true, confirmed=false, fail=false, calls=[];
globalThis.__emailDb={auth:{getUser:async()=>({data:{user:signed?{id:'verified-user',email:'old@example.invalid'}:null},error:null}),updateUser:async(attrs,options)=>{calls.push({attrs,options});return {data:{user:{email:confirmed?attrs.email:'old@example.invalid'}},error:fail?{status:429}:null};}}};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__emailDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSiteUrl=()=>"https://zuno.example"',shortCircuit:true};
 if(specifier==='next/cache')return {url:'data:text/javascript,export const revalidatePath=()=>{}',shortCircuit:true};
 return next(specifier,context);
}});
const {changeEmail}=await import('../src/features/profile/server/email-actions.ts');
function form(email){const data=new FormData();data.set('email',email);data.set('id','forged');return data;}
test('email requests use verified Auth and trusted redirect, retaining the old address until confirmed',async()=>{
 const result=await changeEmail({},form(' new@example.invalid '));
 assert.match(result.message,/confirm/);assert.equal(result.email,undefined);
 assert.deepEqual(calls,[{attrs:{email:'new@example.invalid'},options:{emailRedirectTo:'https://zuno.example/auth/callback'}}]);
 confirmed=true;assert.equal((await changeEmail({},form('new@example.invalid'))).email,'new@example.invalid');
});
test('invalid, unchanged, signed-out and rate-limited email requests are handled',async()=>{
 calls=[];assert.match((await changeEmail({},form('bad'))).error,/valid email/);assert.deepEqual(calls,[]);
 assert.equal((await changeEmail({},form('old@example.invalid'))).email,'old@example.invalid');assert.deepEqual(calls,[]);
 signed=false;assert.match((await changeEmail({},form('new@example.invalid'))).error,/log in/);assert.deepEqual(calls,[]);
 signed=true;fail=true;assert.match((await changeEmail({},form('new@example.invalid'))).error,/wait/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import './helpers/register-runtime.mjs';
let creates=0,user={id:'verified-user'},failAuth=false,failCleanup=false,logs=[];
globalThis.__deleteClient={auth:{getUser:async()=>{if(failAuth)throw Error('private setup detail');return {data:{user},error:null};},signOut:async()=>({error:null})}};
globalThis.__deleteAdmin={rpc:async name=>({data:name==='prepare_account_deletion'?'ready':[],error:failCleanup?{code:'PGRST202',message:'private provider detail'}:null}),storage:{from:()=>({})},auth:{admin:{deleteUser:async()=>({error:null})}}};
globalThis.__createDeleteAdmin=()=>{creates++;return globalThis.__deleteAdmin;};
registerHooks({resolve(specifier,context,next){
 if(specifier==='@supabase/supabase-js')return {url:'data:text/javascript,export const createClient=()=>globalThis.__createDeleteAdmin()',shortCircuit:true};
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__deleteClient',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const getSupabaseConfig=()=>({url:"https://project.supabase.co"})',shortCircuit:true};
 if(specifier==='next/cache')return {url:'data:text/javascript,export const revalidatePath=()=>{}',shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export const redirect=url=>{throw Error("REDIRECT "+url)}',shortCircuit:true};
 return next(specifier,context);
}});
const {deleteAccount}=await import('../src/features/profile/delete-account-action.ts');
const form=(account='verified-user')=>{const f=new FormData();f.set('confirmation','DELETE');f.set('account',account);return f;};
test('account deletion checks confirmation and verified identity before creating a privileged client',async()=>{
 process.env.SUPABASE_SECRET_KEY='test-only-key';const f=form();f.set('confirmation','NO');
 assert.match((await deleteAccount({},f)).error,/DELETE/);
 assert.match((await deleteAccount({},form('forged-user'))).error,/log in/);assert.equal(creates,0);
 user=null;assert.match((await deleteAccount({},form())).error,/log in/);assert.equal(creates,0);user={id:'verified-user'};
 await assert.rejects(deleteAccount({},form()),/REDIRECT \/login/);
});
test('deletion catches setup failures and logs only bounded stage/code/status diagnostics',async()=>{
 const old=console.error;console.error=(...args)=>logs.push(args);
 try{
  failAuth=true;assert.match((await deleteAccount({},form())).error,/try again/i);failAuth=false;
  failCleanup=true;assert.match((await deleteAccount({},form())).error,/try again/i);failCleanup=false;
  assert.ok(logs.some(entry=>entry[1]?.stage==='prepare'&&entry[1]?.code==='PGRST202'));
  assert.doesNotMatch(JSON.stringify(logs),/private|test-only-key/);
 }finally{console.error=old;failAuth=false;failCleanup=false;delete process.env.SUPABASE_SECRET_KEY;}
});

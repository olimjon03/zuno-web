import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import './helpers/register-runtime.mjs';
const actor='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const listing='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
let signed=true, fail=false, calls=[], invalidations=[];
const db={auth:{getUser:async()=>({data:{user:signed?{id:actor,email:"qa@example.invalid",user_metadata:{private:"not-for-ui"}}:null},error:null})},from(table){
 calls.push(['table',table]);
 const q={order:async()=>({data:[{id:1,name:"Neighborhood",region_code:"KR-11"}],error:null}),select(){return q;},eq(key,value){calls.push(['eq',key,value]);return q;},update(value){calls.push(['update',value]);return q;},upsert(value){calls.push(['upsert',value]);return Promise.resolve({error:fail?{}:null});},delete(){calls.push(['delete']);return q;},maybeSingle:async()=>({data:fail?null:table==="neighborhoods"?{id:1,name:"Seongsu-dong",region_code:"KR-11"}:{id:actor,display_name:"QA Neighbor",neighborhood_id:1,avatar_path:null},error:fail?{}:null}),then(resolve){return Promise.resolve({error:fail?{}:null}).then(resolve);}};
 return q;
}};
globalThis.__accountTestDb=db;globalThis.__accountInvalidations=invalidations;
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/features/locations/catalog')return next(new URL('../src/features/locations/catalog.ts',import.meta.url).href,context);
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__accountTestDb',shortCircuit:true};
 if(specifier==='@/lib/supabase/config')return {url:'data:text/javascript,export const isSupabaseConfigured=()=>true',shortCircuit:true};
 if(specifier==='next/navigation')return {url:'data:text/javascript,export const redirect=(url)=>{throw Error(url)}',shortCircuit:true};
 if(specifier==='next/cache')return {url:'data:text/javascript,export const revalidatePath=(path)=>globalThis.__accountInvalidations.push(path)',shortCircuit:true};
 if(specifier==='@/features/listings/validation')return next(new URL('../src/features/listings/validation.ts',import.meta.url).href,context);
 return next(specifier,context);
}});
const {updateProfile,updateNeighborhood,updateDisplayName}=await import('../src/features/profile/server/actions.ts');
const {saveFavorite}=await import('../src/features/favorites/server/actions.ts');
function form(){const f=new FormData();f.set('displayName','  QA Neighbor  ');f.set('neighborhoodId','');f.set('id',listing);f.set('email','forged@example.invalid');return f;}
test('profile update derives identity from Auth, limits fields and returns normalized saved values',async()=>{
 calls=[];signed=false;assert.match((await updateProfile({},form())).error,/log in/);assert.deepEqual(calls,[]);
 signed=true;const result=await updateProfile({},form());
 assert.deepEqual(result.profile,{displayName:'QA Neighbor',neighborhoodId:null});
 assert.deepEqual(calls.find(c=>c[0]==='update'),['update',{display_name:'QA Neighbor',neighborhood_id:null}]);
 assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='id'&&c[2]===actor));
 assert.ok(invalidations.includes('/account/settings'));
 fail=true;assert.match((await updateProfile({},form())).error,/save/);fail=false;
});
test('favorite save and removal scope ownership to verified user and expose retry failures',async()=>{
 calls=[];assert.match((await saveFavorite('invalid',true)).error,/valid listing/);assert.deepEqual(calls,[]);
 signed=false;assert.equal((await saveFavorite(listing,true)).login,true);assert.deepEqual(calls,[]);
 signed=true;assert.deepEqual(await saveFavorite(listing,true),{userId:actor});
 assert.deepEqual(calls.find(c=>c[0]==='upsert'),['upsert',{user_id:actor,listing_id:listing}]);
 calls=[];await saveFavorite(listing,false);
 assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]===actor));
 assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='listing_id'&&c[2]===listing));
 assert.ok(invalidations.includes('/account/saved'));
 fail=true;assert.match((await saveFavorite(listing,true)).error,/update saved/);fail=false;
});

const {getAccountProfile}=await import('../src/features/profile/server/data.ts');
test('account reader fetches the profile once and returns a minimal verified-user projection',async()=>{
 calls=[];const result=await getAccountProfile();
 assert.equal(calls.filter(c=>c[0]==='table'&&c[1]==='profiles').length,1);
 assert.deepEqual(result.user,{id:actor,email:'qa@example.invalid'});
 assert.deepEqual(result.profile,{display_name:'QA Neighbor',neighborhood_id:1});
 assert.equal(result.avatarPath,null);
 assert.deepEqual(result.neighborhoods,[{id:1,name:'Neighborhood',regionCode:'KR-11'}]);
 signed=false;await assert.rejects(getAccountProfile(),/login/);signed=true;
});

test('neighborhood action writes only the verified user area and rejects a different country',async()=>{
 const data=new FormData();data.set('country','KR');data.set('neighborhoodId','1');data.set('displayName','FORGED NAME');data.set('id',listing);
 calls=[];const result=await updateNeighborhood({},data);
 assert.equal(result.neighborhoodId,1);
 assert.deepEqual(calls.find(c=>c[0]==='update'),['update',{neighborhood_id:1}]);
 assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='id'&&c[2]===actor));
 calls=[];data.set('country','UZ');assert.match((await updateNeighborhood({},data)).error,/this country/);assert.ok(!calls.some(c=>c[0]==='update'));
 calls=[];signed=false;data.set('country','KR');assert.match((await updateNeighborhood({},data)).error,/log in/);assert.deepEqual(calls,[]);signed=true;
});

test('name-only saves ignore stale neighborhood and forged email values',async()=>{
 calls=[];const data=form();data.set('neighborhoodId','999');
 const result=await updateDisplayName({},data);assert.equal(result.displayName,'QA Neighbor');
 assert.deepEqual(calls.find(c=>c[0]==='update'),['update',{display_name:'QA Neighbor'}]);
 assert.ok(!calls.some(c=>c[0]==='table'&&c[1]==='neighborhoods'));
});

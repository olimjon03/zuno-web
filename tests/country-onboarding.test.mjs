import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import './helpers/register-runtime.mjs';
const {parseCountryPreference}=await import('../src/features/locations/country-preference.ts');
const {districts}=await import('../src/features/locations/districts.ts');
const {findRegion,regions}=await import('../src/features/locations/catalog.ts');
const {parseFeedFilters,feedParams}=await import('../src/features/search/validation.ts');
test('country cookie parsing rejects malformed identities, unknown countries and trailing data',()=>{
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 assert.deepEqual(parseCountryPreference(id+'.UZ'),{userId:id,country:'UZ'});
 for(const raw of [undefined,'UZ','other.KR',id+'.US',id+'.UZ.extra',id+'.'])assert.equal(parseCountryPreference(raw),null);
});
test('every district belongs to a valid country/region and countries never share district IDs',()=>{
 assert.equal(new Set(districts.map(d=>d.code)).size,districts.length);
 for(const d of districts)assert.ok(findRegion(d.regionCode),d.regionCode);
 for(const country of ['UZ','KR'])for(const region of regions[country])assert.ok(districts.some(d=>d.regionCode===region.code),region.code);
});
test('district selection round trips while forged cross-region filters are discarded',()=>{
 const district=districts.find(d=>d.regionCode==='UZ-NG');
 const valid=parseFeedFilters(new URLSearchParams({country:'UZ',region:'UZ-NG',district:district.code}));
 assert.equal(valid.district,district.code);assert.deepEqual(parseFeedFilters(feedParams(valid)),valid);
 assert.equal(parseFeedFilters(new URLSearchParams({country:'KR',region:'KR-11',district:district.code})).district,undefined);
 assert.equal(parseFeedFilters(new URLSearchParams({country:'UZ',region:'UZ-SA',district:district.code})).district,undefined);
});
let signed=true,fail=false,calls=[],writes=[];
globalThis.__countryDb={auth:{getUser:async()=>({data:{user:signed?{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}:null},error:null})},rpc:async(name,input)=>{calls.push({name,input});return {error:fail?{}:null};}};
globalThis.__countryWrites=writes;
registerHooks({resolve(specifier,context,next){
 if(specifier==='@/lib/supabase/server')return {url:'data:text/javascript,export const createClient=async()=>globalThis.__countryDb',shortCircuit:true};
 if(specifier==='@/features/locations/catalog')return next(new URL('../src/features/locations/catalog.ts',import.meta.url).href,context);
 if(specifier==='next/cache')return {url:'data:text/javascript,export const revalidatePath=()=>{}',shortCircuit:true};
 if(specifier==='./preference')return {url:'data:text/javascript,export const writeCountryPreference=async(...args)=>globalThis.__countryWrites.push(args)',shortCircuit:true};
 return next(specifier,context);
}});
const {confirmCountry}=await import('../src/features/onboarding/server/actions.ts');
test('confirmation validates country, verifies auth and only writes cookie after a successful profile RPC',async()=>{
 const form=new FormData();form.set('country','US');assert.ok((await confirmCountry({},form)).error);assert.equal(calls.length,0);
 form.set('country','UZ');signed=false;assert.ok((await confirmCountry({},form)).error);assert.equal(calls.length,0);
 signed=true;fail=true;assert.ok((await confirmCountry({},form)).error);assert.equal(writes.length,0);
 fail=false;assert.deepEqual(await confirmCountry({},form),{country:'UZ'});
 assert.deepEqual(calls.at(-1),{name:'set_marketplace_country',input:{p_country:'UZ',p_neighborhood_id:null}});
 assert.deepEqual(writes.at(-1),['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','UZ']);
});

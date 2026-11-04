import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import './helpers/register-runtime.mjs';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier,context,next){
 if(specifier.startsWith('@/'))return next(new URL('../src/'+specifier.slice(2)+'.ts',import.meta.url).href,context);
 return next(specifier,context);
}});
const {categoryCatalog}=await import('../src/features/categories/catalog.ts');
const {parseFeedFilters}=await import('../src/features/search/validation.ts');
const {mapRow}=await import('../src/features/listings/server/mapper.ts');
const {messages}=await import('../src/features/language/messages.ts');
const {additionalMessages}=await import('../src/features/language/additional-messages.ts');
const migration=readFileSync(new URL('../supabase/migrations/202611040017_expanded_marketplace_categories.sql',import.meta.url),'utf8');

test('legacy and new goods categories survive URL parsing and database mapping',()=>{
 for(const name of ['Electronics','Home & Living','Fashion','Sports','Books','Other'])assert.ok(categoryCatalog.some(item=>item.name===name));
 for(const item of categoryCatalog){
  assert.equal(parseFeedFilters(new URLSearchParams({category:item.name})).category,item.name);
  if(item.slug){
   const row={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',title:'Local item',price:100,photos:[],category:{name_en:item.name},neighborhood:{name:'Seoul',region_code:'KR-11'},status:'active',condition:'good'};
   assert.equal(mapRow(row).listing.category,item.name);
  }
 }
 assert.equal(parseFeedFilters(new URLSearchParams({category:'Not a real category'})).category,'All items');
});

test('posting seed and translated browsing catalog agree without replacing existing IDs',()=>{
 const rows=[...migration.matchAll(/\('([^']+)', '([^']+)', '([^']+)', (\d+)\)/g)];
 const goods=categoryCatalog.filter(item=>item.slug);
 assert.equal(rows.length,goods.length);
 assert.equal(new Set(goods.map(item=>item.slug)).size,goods.length);
 assert.match(migration,/on conflict \(slug\) do update set/);
 assert.doesNotMatch(migration,/\b(delete|truncate)\b|\bid\s*=/i);
 for(const item of goods){
  const row=rows.find(row=>row[1]===item.slug);assert.equal(row?.[2],item.name,item.name);
  for(const lang of ['uz','ko'])assert.ok(messages[item.name]?.[lang]?.trim(),`${item.name}: ${lang}`);
  for(const lang of ['ru','vi'])assert.ok(additionalMessages[item.name]?.[lang]?.trim(),`${item.name}: ${lang}`);
 }
});

test('3D sprites have valid cells and lightweight transparent assets',async()=>{
 for(const category of categoryCatalog){assert.ok(category.column>=0&&category.column<3);assert.ok(category.row>=0&&category.row<2);}
 for(const atlas of new Set(categoryCatalog.map(item=>item.atlas))){
  const path=new URL(`../public/images/categories/${atlas}.webp`,import.meta.url);
  assert.ok(statSync(path).size<150*1024,atlas);
  const meta=await sharp(fileURLToPath(path)).metadata();assert.ok(meta.hasAlpha,atlas);assert.equal(meta.width/3,meta.height/2);
  const stats=await sharp(fileURLToPath(path)).stats();assert.equal(stats.channels[3].min,0);assert.ok(stats.channels[3].max>200);
 }
});

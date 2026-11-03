import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import './helpers/register-runtime.mjs';
const {heroSlides}=await import('../src/features/marketplace/hero-slides.ts');
const {messages}=await import('../src/features/language/messages.ts');
const {additionalMessages}=await import('../src/features/language/additional-messages.ts');
const root=new URL('../public/',import.meta.url);
test('every hero story has unique identity, complete translations and a real local poster',()=>{
 assert.equal(new Set(heroSlides.map(s=>s.id)).size,heroSlides.length);
 for(const slide of heroSlides){
  assert.match(slide.image,/^\/images\/[a-z0-9-]+\.webp$/);
  assert.ok(statSync(new URL(slide.image.slice(1),root)).size>1000);
  for(const key of [slide.first,slide.second,slide.description,slide.alt]){
   for(const lang of ['uz','ko'])assert.ok(messages[key]?.[lang]?.trim(),`${slide.id} ${lang}: ${key}`);
   for(const lang of ['ru','vi'])assert.ok(additionalMessages[key]?.[lang]?.trim(),`${slide.id} ${lang}: ${key}`);
  }
 }
});
test('hero video assets are bounded, complete MP4 files with fast-start metadata',()=>{
 const videos=new Set(heroSlides.flatMap(s=>s.video?[s.video]:[]));assert.ok(videos.size>0);
 for(const src of videos){
  assert.match(src,/^\/videos\/[a-z0-9-]+\.mp4$/);
  const bytes=readFileSync(new URL(src.slice(1),root));assert.ok(bytes.length>1000&&bytes.length<2*1024*1024,src);
  const boxes=[];let offset=0;
  while(offset<bytes.length){
   assert.ok(offset+8<=bytes.length,`Truncated box: ${src}`);
   let size=bytes.readUInt32BE(offset);const type=bytes.toString('ascii',offset+4,offset+8);
   if(size===1){assert.ok(offset+16<=bytes.length);size=Number(bytes.readBigUInt64BE(offset+8));}
   else if(size===0)size=bytes.length-offset;
   assert.ok(size>=8&&offset+size<=bytes.length,`Invalid box: ${src}`);boxes.push(type);offset+=size;
  }
  assert.equal(boxes[0],'ftyp');assert.ok(boxes.includes('moov')&&boxes.includes('mdat'),src);
  assert.ok(boxes.indexOf('moov')<boxes.indexOf('mdat'),`Metadata must precede media: ${src}`);
 }
});

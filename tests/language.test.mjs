import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/register-runtime.mjs';
const {translate}=await import('../src/features/language/translate.ts');
const {messages}=await import('../src/features/language/messages.ts');
const {isLanguage,languages,countryLanguages}=await import('../src/features/language/catalog.ts');
test('language catalog supports the five supported languages with country-specific menus',()=>{
 assert.deepEqual(languages.map(item=>item.code),['ko','uz','en','ru','vi']);
 for(const value of ['ko','uz','en','ru','vi'])assert.equal(isLanguage(value),true);
 for(const value of ['kr','UZ','fr',null,{},'<script>'])assert.equal(isLanguage(value),false);
});
test('every translated interface message preserves placeholders in both languages',()=>{
 const tokens=text=>[...text.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort();
 for(const [key,entry] of Object.entries(messages))for(const language of ['uz','ko']){
  assert.ok(entry[language].trim(),`${language}: ${key}`);
  assert.deepEqual(tokens(entry[language]),tokens(key),`${language}: ${key}`);
 }
 for(const key of ['Saved','Messages','Sell','Your listings','Profile settings','Language & appearance','Publish item','Mark reserved','Remove item','Safety & privacy']){
  assert.notEqual(translate('ko',key),key);assert.notEqual(translate('uz',key),key);
 }
});
test('translation preserves original English, unknown copy and literal interpolation values',()=>{
 assert.equal(translate('en','Messages'),'Messages');
 assert.equal(translate('uz','Messages'),'Xabarlar');assert.equal(translate('ko','Messages'),'메시지');
 const title='Messages <script> $& {count}';
 assert.equal(translate('uz','View {title}',{title}),`${title} — ko‘rish`);
 assert.equal(translate('ko','{count} views',{count:0}),'조회 0회');
 assert.equal(translate('uz','An untranslated product title'),'An untranslated product title');
});

test('country language options follow onboarding and marketplace choices',()=>{
 assert.deepEqual(countryLanguages('',true),['en','uz','ko','ru']);
 assert.deepEqual(countryLanguages('KR',true),['en','uz','ko','ru']);
 assert.deepEqual(countryLanguages('UZ'),['uz','ru','en']);
 assert.deepEqual(countryLanguages('KR'),['ko','en','uz','vi']);
});
const {additionalMessages}=await import('../src/features/language/additional-messages.ts');
test('Russian and Vietnamese cover the full interface catalog and preserve named placeholders',()=>{
 const tokens=text=>[...text.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
 for(const key of Object.keys(messages))for(const language of ['ru','vi']){
  assert.ok(additionalMessages[key]?.[language]?.trim(),`${language}: ${key}`);
  assert.deepEqual(tokens(additionalMessages[key][language]),tokens(key),`${language}: ${key}`);
 }
 assert.equal(translate('ru','Messages'),'Сообщения');
 assert.equal(translate('vi','Messages'),'Tin nhắn');
});

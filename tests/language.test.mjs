import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/register-runtime.mjs';
const {translate}=await import('../src/features/language/translate.ts');
const {messages}=await import('../src/features/language/messages.ts');
const {isLanguage,languages}=await import('../src/features/language/catalog.ts');
test('language catalog supports only Korean, Uzbek and English with language names and flags',()=>{
 assert.deepEqual(languages.map(item=>item.code),['ko','uz','en']);
 for(const value of ['ko','uz','en'])assert.equal(isLanguage(value),true);
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

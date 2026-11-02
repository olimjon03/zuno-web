import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
// Production resolves extensionless TS imports through Next; this mirrors that
// resolution for native Node tests without adding a runtime dependency.
registerHooks({resolve(specifier,context,next){try{return next(specifier,context);}catch(error){if(specifier.startsWith('.')&&error.code==='ERR_MODULE_NOT_FOUND')return next(specifier+'.ts',context);throw error;}}});
const {parseFeedFilters,feedParams,feedIssue,mergeFeedItems}=await import('../src/features/search/feed-model.ts');
const {encodeFeedCursor,decodeFeedCursor}=await import('../src/features/search/feed-cursor.ts');
test('shareable filters preserve Unicode and local price semantics, normalize invalid areas',()=>{
 const f=parseFeedFilters(new URLSearchParams('country=UZ&region=UZ-TK&q=kamera+%F0%9F%93%B7&category=Electronics&min=0&max=300&available=1&sort=price-asc'));
 assert.equal(f.query,'kamera 📷');assert.equal(f.sort,'price-asc');assert.equal(feedIssue(f),null);
 assert.deepEqual(parseFeedFilters(feedParams(f)),f);
 const all=parseFeedFilters(new URLSearchParams('country=XX&region=UZ-TK&min=10&sort=price-asc&category=Bad'));
 assert.equal(all.country,'');assert.equal(all.region,'');assert.equal(all.minPrice,'');assert.equal(all.sort,'newest');assert.equal(all.category,'All items');
 assert.equal(parseFeedFilters(new URLSearchParams('country=KR&region=UZ-TK')).region,'');
 assert.equal(Array.from(parseFeedFilters(new URLSearchParams({q:'📷'.repeat(101)})).query).length,100);
});
test('invalid price bounds cannot silently query broader results',()=>{
 for(const query of ['min=-1','max=1.2','min=1000000000001','min=1e3','min=20&max=10'])assert.ok(feedIssue(parseFeedFilters(new URLSearchParams('country=UZ&'+query))));
 assert.equal(feedIssue(parseFeedFilters(new URLSearchParams('country=UZ&min=0&max=0'))),null);
});
test('cursor retains microseconds and rejects malformed, cross-filter and cross-sort pagination',()=>{
 const filters=parseFeedFilters(new URLSearchParams('country=UZ'));
 const row={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',created_at:'2026-01-01T12:00:00.123456+00:00',price:100};
 const encoded=encodeFeedCursor(row,filters);
 assert.equal(decodeFeedCursor(encoded,filters).createdAt,row.created_at);
 const local={...row,created_at:'2026-01-01T21:00:00.123456+09:00'};
 assert.equal(decodeFeedCursor(encodeFeedCursor(local,filters),filters).createdAt,local.created_at);
 assert.throws(()=>decodeFeedCursor(encoded,{...filters,sort:'price-desc'}));
 assert.throws(()=>decodeFeedCursor(encoded,{...filters,country:'KR'}));
 for(const value of ['%bad','x'.repeat(1025),Buffer.from('{}').toString('base64url')])assert.throws(()=>decodeFeedCursor(value,filters));
 const malformed=JSON.parse(Buffer.from(encoded,'base64url').toString());
 for(const patch of [{createdAt:'2026-02-31T12:00:00Z'},{price:1.5},{id:'bad'}])assert.throws(()=>decodeFeedCursor(Buffer.from(JSON.stringify({...malformed,...patch})).toString('base64url'),filters));
 assert.equal(decodeFeedCursor(undefined,filters),null);
});
test('appended pages deduplicate live items while preserving sorted page order',()=>{
 assert.deepEqual(mergeFeedItems([{id:'a'},{id:'b'}],[{id:'b'},{id:'c'},{id:'c'},{id:'d'}]).map(x=>x.id),['a','b','c','d']);
});

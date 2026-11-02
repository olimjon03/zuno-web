import test from 'node:test';
import assert from 'node:assert/strict';
import {parseReport} from '../src/features/moderation/validation.ts';
test('reports require a known reason and bounded text, preserving safe Unicode',()=>{
 assert.deepEqual(parseReport('scam',' Suspicious listing '),{reason:'scam',details:'Suspicious listing'});
 assert.equal(parseReport('other','🪑'.repeat(1000)).details.length,2000);
 for(const reason of ['__proto__','constructor','fake',null,3])assert.throws(()=>parseReport(reason,''));
 for(const details of [null,{},'x'.repeat(1001)])assert.throws(()=>parseReport('other',details));
});

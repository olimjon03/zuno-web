import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeMessages } from '../src/features/messages/message-model.ts';
const message=(id,body=String(id))=>({id,body,sender_id:'sender',created_at:'2026-11-03T00:00:00Z'});
test('overlapping send confirmations, reconnect batches and older pages deduplicate in order',()=>{
 const initial=[message(51),message(52)];
 const confirmed=mergeMessages(initial,[message(52),message(53)]);
 const reconnected=mergeMessages(confirmed,[message(53,'confirmed'),message(54)]);
 const history=mergeMessages(reconnected,[message(50),message(51)]);
 assert.deepEqual(history.map(m=>m.id),[50,51,52,53,54]);
 assert.equal(history.find(m=>m.id===53).body,'confirmed');
 assert.deepEqual(initial,[message(51),message(52)]);
 assert.deepEqual(mergeMessages(history,[]),history);
});

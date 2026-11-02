import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefreshQueue, subscribeToMessageChanges } from '../src/features/messages/realtime.ts';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('Realtime events during a fetch trigger one trailing refresh; disposal cancels queued work',async()=>{
 let calls=0,release;const queue=createRefreshQueue(async()=>{calls++;if(calls===1)await new Promise(resolve=>{release=resolve;});});
 queue.request();queue.request();queue.request();assert.equal(calls,1);release();await tick();assert.equal(calls,2);
 queue.dispose();queue.request();await tick();assert.equal(calls,2);
 let finish,cancelledCalls=0;const cancelled=createRefreshQueue(async()=>{cancelledCalls++;await new Promise(r=>finish=r);});cancelled.request();cancelled.request();cancelled.dispose();finish();await tick();assert.equal(cancelledCalls,1);
});
test('refresh failures are handled and a subsequent event can retry',async()=>{
 let attempts=0,errors=0;const queue=createRefreshQueue(async()=>{if(++attempts===1)throw Error('offline');},()=>errors++);queue.request();await tick();queue.request();await tick();assert.equal(attempts,2);assert.equal(errors,1);queue.dispose();
});
test('subscriptions use incoming inserts and own read markers; cleanup silences stale events',()=>{
 const bindings=[];let statusHandler,removed=0,messageIds=[],reads=0,statuses=[];
 const channel={on(type,filter,callback){bindings.push({type,filter,callback});return this;},subscribe(callback){statusHandler=callback;return this;}};
 const db={channel:()=>channel,removeChannel(c){assert.equal(c,channel);removed++;return Promise.resolve('ok');}};
 const cleanup=subscribeToMessageChanges(db,'user-id',{message:id=>messageIds.push(id),reads:()=>reads++,status:s=>statuses.push(s)});
 assert.deepEqual(bindings.map(b=>[b.filter.event,b.filter.table,b.filter.filter]),[['INSERT','messages',undefined],['INSERT','message_reads','user_id=eq.user-id'],['UPDATE','message_reads','user_id=eq.user-id']]);
 bindings[0].callback({new:{conversation_id:'conversation-id'}});bindings[1].callback();bindings[2].callback();statusHandler('SUBSCRIBED');
 assert.deepEqual(messageIds,['conversation-id']);assert.equal(reads,2);assert.deepEqual(statuses,['SUBSCRIBED']);
 cleanup();assert.equal(removed,1);bindings[0].callback({new:{conversation_id:'stale'}});bindings[1].callback();statusHandler('CLOSED');
 assert.deepEqual(messageIds,['conversation-id']);assert.equal(reads,2);assert.deepEqual(statuses,['SUBSCRIBED']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/register-runtime.mjs';
const {notificationHref,parseNotificationSnapshot,parseMessageAlerts}=await import('../src/features/notifications/model.ts');
const id='11111111-1111-4111-8111-111111111111';
const item={id,kind:'announcement',title:'A site notice',body:'<b>User content</b>',href:'/help',created_at:'2026-11-04T01:00:00Z',read_at:null};
test('notification links stay inside supported website routes',()=>{
 for(const link of ['/account','/account/listings','/account/safety','/help#about',`/messages/${id}`,`/listings/${id}`])assert.equal(notificationHref(link),link);
 for(const link of ['https://evil.example','//evil.example','javascript:alert(1)','/\\evil','/%2f%2fevil','/messages/not-a-uuid','/help?next=https://evil.example',null,{},'/account\n'])assert.equal(notificationHref(link),'/account');
});
test('notification snapshots preserve text, bound rows and reject malformed envelopes',()=>{
 assert.deepEqual(parseNotificationSnapshot({items:[item],unread_count:1}),{items:[item],unread_count:1});
 for(const value of [null,{},[],{items:[],unread_count:-1},{items:[],unread_count:'2'},{items:[],unread_count:NaN}])assert.throws(()=>parseNotificationSnapshot(value));
 const parsed=parseNotificationSnapshot({items:[null,{}, {...item,id:'bad'}, {...item,read_at:'bad'}, {...item,href:'//evil.example'},...Array(25).fill(item)],unread_count:30});
 assert.equal(parsed.items[0].href,'/account');assert.ok(parsed.items.length<=20);assert.equal(parsed.unread_count,30);assert.equal(parsed.items[0].body,'<b>User content</b>');
});
test('message alerts require valid conversation IDs and positive integer unread counts',()=>{
 const rows=[null,{}, {id,other_name:'Neighbor <script>',last_message:'Hello',listing_title:'An item'}, {id:'bad',other_name:'Forged'}];
 assert.deepEqual(parseMessageAlerts(rows,{[id]:2,bad:3}),[{id,name:'Neighbor <script>',preview:'Hello',count:2}]);
 assert.deepEqual(parseMessageAlerts(rows,{[id]:0}),[]);assert.deepEqual(parseMessageAlerts(rows,{[id]:1.5}),[]);assert.deepEqual(parseMessageAlerts({},{}),[]);
});

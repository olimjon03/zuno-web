import test from 'node:test';
import assert from 'node:assert/strict';
import {filterInbox,inboxTime} from '../src/features/messages/inbox-model.ts';
const rows=[{id:'a',otherName:'민지',listingTitle:'Camera',lastMessage:'Still available?',neighborhood:'Seoul'},{id:'b',otherName:'Aziz',listingTitle:'Chair',lastMessage:null,neighborhood:null}];
test('inbox search combines seller, item, snippet and neighborhood with unread state',()=>{
 assert.equal(filterInbox(rows,'camera',false,{}).length,1);
 assert.equal(filterInbox(rows,'AVAILABLE',false,{}).length,1);
 assert.equal(filterInbox(rows,' 민지 ',false,{}).length,1);
 assert.equal(filterInbox(rows,'seoul',true,{a:1}).length,1);
 assert.equal(filterInbox(rows,'seoul',true,{b:2}).length,0);
 assert.equal(filterInbox(rows,'',true,{}).length,0);
 assert.equal(filterInbox(rows,'aziz',false,{}).length,1);
});
test('inbox timestamps use the supplied snapshot and handle missing/future dates',()=>{
 const now=Date.parse('2026-11-03T12:00:00Z');
 assert.equal(inboxTime('invalid',now),'');
 assert.equal(inboxTime('2026-11-03T12:01:00Z',now),'Now');
 assert.equal(inboxTime('2026-11-03T11:48:00Z',now),'12m ago');
 assert.equal(inboxTime('2026-11-03T10:00:00Z',now),'2h ago');
 assert.equal(inboxTime('2026-11-01T12:00:00Z',now),'2d ago');
});

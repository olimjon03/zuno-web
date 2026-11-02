import test from 'node:test';
import assert from 'node:assert/strict';
import {isNavigationActive} from '../src/components/layout/navigation.ts';
test('navigation keeps saved separate from account and respects path segment boundaries',()=>{
 assert.equal(isNavigationActive('/account/saved','/account',true),false);
 assert.equal(isNavigationActive('/account/saved/archived','/account',true),false);
 assert.equal(isNavigationActive('/account/settings','/account',true),true);
 assert.equal(isNavigationActive('/account/listings','/account',true),true);
 assert.equal(isNavigationActive('/account/settings','/account'),false);
 assert.equal(isNavigationActive('/messages/abc','/messages'),true);
 assert.equal(isNavigationActive('/messages-other','/messages'),false);
 assert.equal(isNavigationActive('/account/saved-other','/account/saved'),false);
 assert.equal(isNavigationActive('/help','/'),false);
 assert.equal(isNavigationActive('/','/'),true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
const eslint=new ESLint();
async function blocked(code,filePath){
 const [result]=await eslint.lintText(code,{filePath});
 return result.messages.some(message=>message.ruleId==='no-restricted-imports');
}
test('client UI can call actions but cannot import server data, Node or server-only types',async()=>{
 const file='src/features/listings/components/boundary-check.tsx';
 assert.equal(await blocked('import { manageListing } from "../server/actions"; void manageListing;',file),false);
 assert.equal(await blocked('import type { Listing } from "../types"; const item:Listing|null=null; void item;',file),false);
 for(const code of ['import { getLiveListing } from "../server/data"; void getLiveListing;','import type { ListingRow } from "../server/types"; const row:ListingRow|null=null; void row;','import { createHash } from "node:crypto"; void createHash;'])assert.equal(await blocked(code,file),true);
});
test('shared validation and thin route adapters cannot pull in database infrastructure',async()=>{
 assert.equal(await blocked('import { createPublicClient } from "@/lib/supabase/public"; void createPublicClient;','src/features/search/validation.ts'),true);
 assert.equal(await blocked('import { createClient } from "@/lib/supabase/server"; void createClient;','src/app/api/listings/route.ts'),true);
 assert.equal(await blocked('import { createListing } from "@/features/listings/server/create-listing"; void createListing;','src/app/api/listings/route.ts'),false);
});

test('messages UI uses server action entrypoints and shared contracts',async()=>{
 const file='src/features/messages/chat.tsx';
 assert.equal(await blocked('import { postMessage } from "./server/actions"; void postMessage;',file),false);
 assert.equal(await blocked('import { markMessagesRead } from "./server/unread-actions"; void markMessagesRead;',file),false);
 assert.equal(await blocked('import { getInbox } from "./server/inbox-data"; void getInbox;',file),true);
 assert.equal(await blocked('import { createClient } from "@/lib/supabase/server"; void createClient;',file),true);
 assert.equal(await blocked('import { createClient } from "@/lib/supabase/client"; void createClient;','src/features/messages/validation.ts'),true);
});

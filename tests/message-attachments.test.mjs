import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/register-runtime.mjs';
import sharp from 'sharp';
const {prepareMessageFile}=await import('../src/features/messages/server/prepare-file.ts');
const {validateAttachmentSelection,attachmentName,MAX_ATTACHMENT_BYTES}=await import('../src/features/messages/attachments.ts');
test('attachment selection bounds count, file type and original sizes',()=>{
 const file=new File(['hello'],'details.txt',{type:'text/plain'});
 validateAttachmentSelection([file]);
 for(const files of [[],Array(5).fill(file),[new File([],'empty.txt')],[new File(['x'],'script.html')],[new File([new Uint8Array(MAX_ATTACHMENT_BYTES+1)],'big.pdf')]])assert.throws(()=>validateAttachmentSelection(files));
 assert.equal(attachmentName('../bad\nname.txt'),'.._bad_name.txt');
 const long=attachmentName('a'.repeat(200)+'.pdf');assert.equal(long.length,160);assert.ok(long.endsWith('.pdf'));
});
test('photos are decoded and reencoded; document signatures and text encoding are checked',async()=>{
 const bytes=await sharp({create:{width:20,height:20,channels:3,background:'#0d9488'}}).jpeg().toBuffer();
 const image=await prepareMessageFile(new File([bytes],'chair.jpg',{type:'image/jpeg'}));
 assert.equal(image.mime,'image/webp');assert.equal((await sharp(image.bytes).metadata()).format,'webp');
 const pdf=await prepareMessageFile(new File(['%PDF-1.4\nfixture'],'details.pdf',{type:'application/pdf'}));assert.equal(pdf.mime,'application/pdf');
 const txt=await prepareMessageFile(new File(['Salom 안녕하세요'],'hello.txt'));assert.equal(txt.mime,'text/plain');
 for(const file of [new File(['<html>bad</html>'],'bad.pdf'),new File(['not zip'],'bad.docx'),new File([new Uint8Array([0,1,2])],'bad.txt'),new File(['broken'],'fake.jpg',{type:'image/jpeg'})])await assert.rejects(prepareMessageFile(file));
});

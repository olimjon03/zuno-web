import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { isUuid } from "@/features/listings/validation";
import { prepareMessageFile } from "./prepare-file";
import { BodyTooLargeError, readBoundedForm } from "@/features/listings/server/request-body";
import { attachmentName, MAX_ATTACHMENT_BYTES, validateAttachmentSelection } from "../attachments";
const BUCKET = "zuno-message-files";
const reply = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
export async function sendAttachments(request: Request) {
  if (request.headers.get("origin") !== getSiteUrl()) return reply("Send files from ZUNO.", 403);
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) return reply("Please log in again.", 401);
  const uploaded: string[] = [];
  let commitUncertain = false;
  // Never remove a file committed by an RPC whose response was lost.
  async function cleanup() {
    if (!uploaded.length) return;
    const { data, error } = await db.from("message_attachments").select("storage_path").in("storage_path", uploaded);
    if (error) return;
    const attached = new Set((data ?? []).map(row => row.storage_path));
    const unused = uploaded.filter(path => !attached.has(path));
    if (unused.length) await db.storage.from(BUCKET).remove(unused);
  }
  try {
    const form = await readBoundedForm(request, MAX_ATTACHMENT_BYTES + 128 * 1024);
    const conversationId = form.get("conversationId"), clientId = form.get("clientId"), body = form.get("body");
    if (typeof conversationId !== "string" || !isUuid(conversationId) || typeof clientId !== "string" || !isUuid(clientId) || typeof body !== "string" || Array.from(body.trim()).length > 2000) return reply("Reload the conversation and try again.", 400);
    const { data: conversation, error: accessError } = await db.from("conversations").select("buyer_id,seller_id").eq("id", conversationId).maybeSingle();
    if (accessError || !conversation || ![conversation.buyer_id, conversation.seller_id].includes(user.id)) return reply("Conversation unavailable.", 404);
    const { data: existing, error: retryError } = await db.from("messages").select("id").eq("conversation_id", conversationId).eq("sender_id", user.id).eq("client_id", clientId).maybeSingle();
    if (retryError) return reply("Could not check delivery. Your files have been kept.", 503);
    if (existing) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
    const files = form.getAll("files");
    if (!files.every(file => file instanceof File)) return reply("Choose valid files.", 400);
    let prepared;
    try {
      validateAttachmentSelection(files as File[]);
      if ((files as File[]).reduce((sum, file) => sum + file.size, 0) > MAX_ATTACHMENT_BYTES) throw new Error("Send up to 3 MB of files at a time.");
      prepared = [];
      for (const file of files as File[]) prepared.push(await prepareMessageFile(file));
      if (prepared.reduce((sum, file) => sum + file.bytes.length, 0) > MAX_ATTACHMENT_BYTES) throw new Error("Send up to 3 MB of files at a time.");
    } catch (error) { return reply(error instanceof Error ? error.message : "Choose valid files.", 400); }
    // Detect unavailable schema before uploading any objects.
    const { error: schemaError } = await db.from("message_attachments").select("id").limit(0);
    if (schemaError) return reply("Photo and file sharing is temporarily unavailable. Your files have been kept.", 503);
    const attachments = [];
    for (const file of prepared) {
      const id = randomUUID();
      const path = `${user.id}/${conversationId}/${id}`;
      const { error } = await db.storage.from(BUCKET).upload(path, file.bytes, { contentType: file.mime, upsert: false });
      if (error) throw new Error("Could not upload your files. Please try again.");
      uploaded.push(path);
      attachments.push({ id, storage_path: path, name: file.name, mime: file.mime, size: file.bytes.length });
    }
    commitUncertain = true;
    const { error } = await db.rpc("send_message_attachments", { p_conversation_id: conversationId, p_client_id: clientId, p_body: body.trim(), p_attachments: attachments });
    // A network failure may leave the database transaction in flight. Do not
    // race cleanup against that commit, even if a metadata read is still empty.
    commitUncertain = Boolean(error && !["P0002", "22023", "22P02", "23505", "23514", "42501", "PGRST202"].includes(error.code));
    if (!commitUncertain) await cleanup();
    if (error) return reply(error.code === "P0002" ? "Messaging is unavailable between you and this user. Your files have been kept." : "Could not confirm delivery. Retry safely with the same files.", 503);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (!commitUncertain) await cleanup().catch(() => {});
    return reply(error instanceof BodyTooLargeError ? "Send up to 3 MB of files at a time." : "Could not confirm delivery. Your files have been kept. Please retry.", error instanceof BodyTooLargeError ? 413 : 503);
  }
}
export async function readAttachment(request: Request, id: string) {
  if (!isUuid(id)) return reply("File unavailable.", 404);
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) return reply("Please log in again.", 401);
  const { data: file, error } = await db.from("message_attachments").select("storage_path,name,mime,size").eq("id", id).maybeSingle();
  if (error || !file) return reply("File unavailable.", 404);
  const { data, error: downloadError } = await db.storage.from(BUCKET).download(file.storage_path);
  if (downloadError || !data) return reply("Could not download this file. Please retry.", 503);
  const inline = file.mime === "image/webp" && new URL(request.url).searchParams.get("download") !== "1";
  return new Response(data, { headers: {
    "Content-Type": file.mime, "Content-Length": String(data.size),
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="attachment"; filename*=UTF-8''${encodeURIComponent(attachmentName(file.name)).replace(/['()*]/g, c => "%" + c.charCodeAt(0).toString(16))}`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
}

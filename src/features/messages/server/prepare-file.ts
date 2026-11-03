import "server-only";
import { processPhoto } from "../../listings/server/process-photo";
import { attachmentName, DOCUMENT_TYPES, MAX_ATTACHMENT_BYTES, PHOTO_TYPES, validateAttachmentSelection } from "../attachments";
export async function prepareMessageFile(file: File) {
  validateAttachmentSelection([file]);
  if (PHOTO_TYPES.includes(file.type)) {
    const bytes = await processPhoto(file, MAX_ATTACHMENT_BYTES);
    return { bytes, mime: "image/webp", name: attachmentName(file.name.replace(/\.[^.]+$/, "") + ".webp") };
  }
  const extension = file.name.split(".").at(-1)!.toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());
  if (extension === "pdf" && !bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("Choose a readable PDF file.");
  if (["zip", "docx", "xlsx"].includes(extension) && !["504b0304", "504b0506", "504b0708"].includes(bytes.subarray(0, 4).toString("hex"))) throw new Error("This document could not be read.");
  if (["txt", "csv"].includes(extension)) {
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { throw new Error("Choose a UTF-8 text file."); }
    if (bytes.includes(0)) throw new Error("Choose a UTF-8 text file.");
  }
  return { bytes, mime: DOCUMENT_TYPES[extension], name: attachmentName(file.name) };
}

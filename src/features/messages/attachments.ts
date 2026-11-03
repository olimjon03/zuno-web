export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGE_ORIGINAL_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_TYPES: Record<string, string> = {
  pdf: "application/pdf", txt: "text/plain", csv: "text/csv", zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export function attachmentName(name: string) {
  const clean = name.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069/\\]/g, "_").trim() || "attachment";
  if (clean.length <= 160) return clean;
  const extension = /\.[a-z0-9]{1,10}$/i.exec(clean)?.[0] ?? "";
  return clean.slice(0, 160 - extension.length) + extension;
}
export function validateAttachmentSelection(files: File[]) {
  if (!files.length || files.length > MAX_ATTACHMENTS) throw new Error("Choose up to 4 photos or files.");
  for (const file of files) {
    if (!file.size) throw new Error("Empty files cannot be sent.");
    if (PHOTO_TYPES.includes(file.type)) {
      if (file.size > MAX_IMAGE_ORIGINAL_BYTES) throw new Error("Choose photos up to 10 MB.");
    } else {
      const extension = file.name.split(".").at(-1)?.toLowerCase() ?? "";
      if (!DOCUMENT_TYPES[extension]) throw new Error("Choose a PDF, TXT, CSV, ZIP, DOCX or XLSX file.");
      if (file.size > MAX_ATTACHMENT_BYTES) throw new Error("Choose files up to 3 MB.");
    }
  }
}
export function formatFileSize(size: number) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

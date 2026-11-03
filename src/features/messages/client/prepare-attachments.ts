import "client-only";
import { preparePhotos } from "@/features/listings/client/prepare-photos";
import { DOCUMENT_TYPES, MAX_ATTACHMENT_BYTES, PHOTO_TYPES, validateAttachmentSelection } from "../attachments";
export async function prepareAttachments(files: File[]) {
  validateAttachmentSelection(files);
  const prepared: File[] = [];
  for (const file of files) {
    if (PHOTO_TYPES.includes(file.type)) prepared.push(...await preparePhotos([file]));
    else {
      const extension = file.name.split(".").at(-1)!.toLowerCase();
      prepared.push(new File([file], file.name, { type: DOCUMENT_TYPES[extension] }));
    }
  }
  if (prepared.reduce((sum, file) => sum + file.size, 0) > MAX_ATTACHMENT_BYTES) throw new Error("Send up to 3 MB of files at a time.");
  return prepared;
}

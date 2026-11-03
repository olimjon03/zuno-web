import { readAttachment } from "@/features/messages/server/media";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return readAttachment(request, (await params).id);
}

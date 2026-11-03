import { sendAttachments } from "@/features/messages/server/media";
export async function POST(request: Request) { return sendAttachments(request); }

import type { NextRequest } from "next/server";
import { uploadAvatar } from "@/features/profile/server/upload-avatar";

export async function POST(request: NextRequest) {
  return uploadAvatar(request);
}

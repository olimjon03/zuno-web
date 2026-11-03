import { NextRequest } from "next/server";
import { recordListingView } from "@/features/listings/server/record-view";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return recordListingView(request, (await params).id);
}

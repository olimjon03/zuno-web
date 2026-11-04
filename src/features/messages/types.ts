export type MessageAttachment = { id: string; message_id?: number; name: string; mime: string; size: number; sort_order: number };
export type Message = {
  attachments?: MessageAttachment[];
  id: number;
  sender_id: string;
  body: string;
  trade_status?: "reserved" | "sold" | "received" | null;
  created_at: string;
};

export type InboxEntry = {
  id: string;
  listingId: string | null;
  listingTitle: string;
  otherId: string;
  otherName: string;
  avatarPath: string | null;
  neighborhood: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  thumbnailId: string | null;
};

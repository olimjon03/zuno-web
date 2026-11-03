export type Message = {
  id: number;
  sender_id: string;
  body: string;
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

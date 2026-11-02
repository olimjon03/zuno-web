import { isUuid } from "../listings/validation";
export function parseMessage(
  conversationId: unknown,
  clientId: unknown,
  body: unknown,
) {
  if (
    typeof conversationId !== "string" ||
    !isUuid(conversationId) ||
    typeof clientId !== "string" ||
    !isUuid(clientId)
  )
    throw new Error("Reload the conversation and try again.");
  if (
    typeof body !== "string" ||
    Array.from(body.trim()).length < 1 ||
    Array.from(body.trim()).length > 2000
  )
    throw new Error("Write a message between 1 and 2,000 characters.");
  return { conversationId, clientId, body: body.trim() };
}
export type Message = {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

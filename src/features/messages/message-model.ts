import type { Message } from "./types";

// Realtime, send confirmation and history pages can overlap.
export function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const messages = new Map(current.map(message => [message.id, message]));
  for (const message of incoming) messages.set(message.id, message);
  return [...messages.values()].sort((a, b) => a.id - b.id);
}

"use server";
import { redirect } from "next/navigation";
import { startSocialOAuth } from "./social-oauth";
import type { AuthState } from "./actions";

export async function loginWithTelegram(): Promise<AuthState> {
  const result = await startSocialOAuth("custom:telegram");
  if (result.destination) redirect(result.destination);
  return { error: result.error };
}
export async function loginWithKakao(): Promise<AuthState> {
  const result = await startSocialOAuth("kakao");
  if (result.destination) redirect(result.destination);
  return { error: result.error };
}

"use client";
import { Text, useT } from "@/features/language/provider";

import { startTransition, useActionState, useState } from "react";
import { changeEmail } from "./server/email-actions";
export function EmailForm({ email }: { email: string }) {
  const t = useT();
  const [value, setValue] = useState(email);
  const [state, action, pending] = useActionState(changeEmail, {});
  return <form className="auth-form" aria-label={t("Change email")} aria-busy={pending} onSubmit={event => {event.preventDefault();const data=new FormData();data.set("email",value);startTransition(()=>action(data));}}>
    <div className="sell-field"><label htmlFor="profile-email"><Text>{"Email"}</Text></label><input id="profile-email" name="email" type="email" autoComplete="email" maxLength={254} required value={value} disabled={pending} onChange={event=>setValue(event.target.value)} aria-describedby="profile-email-help"/><p id="profile-email-help" className="auth-hint"><Text>{"Current email:"}</Text>{state.email || email || <Text>{"Not shared"}</Text>}<Text>{". A new address may need email confirmation."}</Text></p></div>
    <button className="button button-outline" disabled={pending || value.trim().toLowerCase() === (state.email || email).toLowerCase()}>{pending ? <Text>{"Requesting…"}</Text> : <Text>{"Change email"}</Text>}</button>
    {state.error && <p className="auth-error" role="alert"><Text>{state.error}</Text></p>}{state.message && <p className="profile-success" role="status"><Text>{state.message}</Text></p>}
  </form>;
}

"use client";
import { Text } from "@/features/language/provider";

import { useActionState } from "react";
import { reviewReport } from "./actions";
export function ReviewForm({reportId}:{reportId:string}) {
 const [state,action,pending]=useActionState(reviewReport,{});
 return <form action={action} aria-busy={pending}><input type="hidden" name="reportId" value={reportId}/><fieldset disabled={pending}><legend className="sr-only"><Text>{"Review report"}</Text></legend><label className="remove-confirm"><input type="checkbox" name="confirm" value="yes"/><Text>{"Confirm hiding this listing from the marketplace"}</Text></label><div className="manage-actions"><button className="button button-outline" name="intent" value="dismiss"><Text>{"Dismiss report"}</Text></button><button className="button button-primary" name="intent" value="remove"><Text>{"Hide listing"}</Text></button></div></fieldset>{pending&&<p role="status"><Text>{"Saving review…"}</Text></p>}{state.error&&<p role="alert" className="auth-error"><Text>{state.error}</Text></p>}{state.message&&<p role="status"><Text>{state.message}</Text></p>}</form>;
}

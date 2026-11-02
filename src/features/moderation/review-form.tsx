"use client";
import { useActionState } from "react";
import { reviewReport } from "./actions";
export function ReviewForm({reportId}:{reportId:string}) {
 const [state,action,pending]=useActionState(reviewReport,{});
 return <form action={action} aria-busy={pending}><input type="hidden" name="reportId" value={reportId}/><fieldset disabled={pending}><legend className="sr-only">Review report</legend><label className="remove-confirm"><input type="checkbox" name="confirm" value="yes"/>Confirm hiding this listing from the marketplace</label><div className="manage-actions"><button className="button button-outline" name="intent" value="dismiss">Dismiss report</button><button className="button button-primary" name="intent" value="remove">Hide listing</button></div></fieldset>{pending&&<p role="status">Saving review…</p>}{state.error&&<p role="alert" className="auth-error">{state.error}</p>}{state.message&&<p role="status">{state.message}</p>}</form>;
}

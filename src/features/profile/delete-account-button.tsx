"use client";

import { useActionState, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/features/language/provider";
import { deleteAccount } from "./delete-account-action";
import "./delete-account-button.css";

export function DeleteAccountButton({ accountId }: { accountId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const [state, action, pending] = useActionState(deleteAccount, {});

  return (
    <div className="delete-account">
      <button type="button" className="button delete-account-trigger" onClick={() => dialog.current?.showModal()}>
        <Icon name="trash" />
        <Text>{"Delete account"}</Text>
      </button>
      <dialog
        ref={dialog}
        className="delete-account-dialog"
        aria-labelledby="delete-account-title"
        onCancel={(event) => { if (pending) event.preventDefault(); }}
        onClose={() => setConfirmation("")}
      >
        <h2 id="delete-account-title"><Text>{"Delete account"}</Text></h2>
        <p><Text>{"Your profile and listings will be permanently deleted. Messages and shared chat files remain available to the other participant under Deleted account."}</Text></p>
        <form action={action} aria-busy={pending}>
          <input type="hidden" name="account" value={accountId} />
          <label htmlFor="delete-account-confirmation"><Text>{"Type DELETE to confirm."}</Text></label>
          <input
            id="delete-account-confirmation"
            name="confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            readOnly={pending}
            required
          />
          {state.error && <p role="alert" className="auth-error"><Text>{state.error}</Text></p>}
          <div className="delete-account-actions">
            <button type="button" className="button button-outline" disabled={pending} onClick={() => dialog.current?.close()}>
              <Text>{"Cancel"}</Text>
            </button>
            <button className="button delete-account-confirm" disabled={confirmation !== "DELETE" || pending}>
              <Text>{pending ? "Deleting account…" : "Delete account"}</Text>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

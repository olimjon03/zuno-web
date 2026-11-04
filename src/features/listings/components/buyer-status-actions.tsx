"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/features/language/provider";
import { Avatar } from "@/features/profile/avatar";
import { getListingBuyerChoices, manageListing } from "../server/actions";
import "./buyer-status-actions.css";

type Buyer = NonNullable<Awaited<ReturnType<typeof getListingBuyerChoices>>["buyers"]>[number];
type Mode = "reserved" | "sold";

export function BuyerStatusActions({ id, title, status, disabled }: {
  id: string;
  title: string;
  status: string;
  disabled: boolean;
}) {
  const heading = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const locked = useRef(false);
  const request = useRef(0);
  const [mode, setMode] = useState<Mode>("reserved");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [choice, setChoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function open(next: Mode) {
    const version = ++request.current;
    setMode(next);
    setBuyers([]);
    setChoice("");
    setError("");
    setMessage("");
    setLoading(true);
    dialog.current?.showModal();
    try {
      const result = await getListingBuyerChoices(id);
      if (version !== request.current) return;
      setBuyers(result.buyers ?? []);
      setError(result.error ?? "");
    } catch {
      if (version === request.current) setError("Buyer choices could not be loaded.");
    } finally {
      if (version === request.current) setLoading(false);
    }
  }

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || loading) return;
    locked.current = true;
    setPending(true);
    setError("");
    const form = new FormData();
    form.set("id", id);
    form.set("intent", mode);
    if (choice) form.set("conversation", choice);
    try {
      const result = await manageListing({}, form);
      if (result.error) setError(result.error);
      else {
        setMessage(choice ? "Buyer notified." : "Changes saved.");
        dialog.current?.close();
      }
    } catch {
      setError("We couldn’t save your changes. Please try again.");
    } finally {
      setPending(false);
      locked.current = false;
    }
  }

  const label = mode === "reserved" ? "Mark reserved" : "Mark sold";
  return <>
    <div className="owned-status-actions">
      <button type="button" aria-haspopup="dialog" disabled={disabled || pending || status !== "active"} onClick={() => void open("reserved")}>
        <Icon name="clock" /><span><Text>{"Mark reserved"}</Text></span>
      </button>
      <button type="button" aria-haspopup="dialog" disabled={disabled || pending || status === "sold"} onClick={() => void open("sold")}>
        <Icon name="bag-check" /><span><Text>{"Mark sold"}</Text></span>
      </button>
    </div>
    {message && <p role="status" className="owned-result"><Text>{message}</Text></p>}
    <dialog ref={dialog} className="buyer-status-dialog" aria-labelledby={heading}
      onClose={() => { request.current++; }}
      onCancel={event => { if (locked.current) event.preventDefault(); }}>
      <h2 id={heading}><Text>{label}</Text></h2>
      <p>{title}</p>
      <form onSubmit={confirm}>
        <fieldset disabled={pending}>
          <legend><Text>{"Choose a buyer (optional)"}</Text></legend>
          <label className="buyer-status-option">
            <input type="radio" name="buyer" value="" checked={!choice} onChange={() => setChoice("")} />
            <Text>{"Continue without a buyer"}</Text>
          </label>
          {loading && <p role="status"><Text>{"Loading…"}</Text></p>}
          {!loading && !error && buyers.length === 0 && <p><Text>{"No buyers have messaged about this listing yet."}</Text></p>}
          {buyers.map(buyer => <label className="buyer-status-option" key={buyer.id}>
            <input type="radio" name="buyer" value={buyer.id} checked={choice === buyer.id} onChange={() => setChoice(buyer.id)} />
            <Avatar name={buyer.buyer_name} path={buyer.avatar_path} />
            <span><strong>{buyer.buyer_name}{buyer.reserved_buyer && <> · <Text>{"Reserved buyer"}</Text></>}</strong><small>{buyer.last_message}</small></span>
          </label>)}
        </fieldset>
        {error && <p className="auth-error" role="alert"><Text>{error}</Text></p>}
        <div className="buyer-status-buttons">
          <button type="button" className="button button-outline" disabled={pending} onClick={() => dialog.current?.close()}><Text>{"Cancel"}</Text></button>
          <button type="submit" className="button button-primary" disabled={loading || pending}>
            <Text>{pending ? "Saving changes…" : label}</Text>
          </button>
        </div>
      </form>
    </dialog>
  </>;
}

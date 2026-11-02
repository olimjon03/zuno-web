"use client";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { manageListing } from "../manage-actions";
import { conditions, conditionLabels } from "../validation";
import { formatPrice } from "../sample-listings";
import type { LookupOption } from "../server/data";
export type OwnedListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category_id: number;
  neighborhood_id: number;
  status: string;
};
export function ManageListing({
  item,
  categories,
  neighborhoods,
}: {
  item: OwnedListing;
  categories: LookupOption[];
  neighborhoods: LookupOption[];
}) {
  const [draft, setDraft] = useState({ ...item, price: String(item.price) });
  const update = (field: keyof OwnedListing, value: string | number) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const [result, action, pending] = useActionState(manageListing, {});
  return (
    <article className="owned-item">
      <h2>
        <Link href={`/listings/${item.id}`}>{item.title}</Link>
      </h2>
      <p>
        {formatPrice(Number(item.price))} ·{" "}
        <strong>
          {item.status === "sold"
            ? "Sold"
            : item.status === "reserved"
              ? "Reserved"
              : "Available"}
        </strong>
      </p>
      <form method="post" className="sell-form" aria-busy={pending} onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        data.set("intent", submitter instanceof HTMLButtonElement ? submitter.value : "edit");
        // Keep controlled select values after a failed Server Action.
        data.set("title", draft.title);
        data.set("price", draft.price);
        data.set("condition", draft.condition);
        data.set("categoryId", String(draft.category_id));
        data.set("neighborhoodId", String(draft.neighborhood_id));
        data.set("description", draft.description);
        startTransition(() => action(data));
      }}>
        <input type="hidden" name="id" value={item.id} />
        <fieldset disabled={pending}>
          <legend className="sr-only">Manage {item.title}</legend>
          <details>
            <summary>Edit item details</summary>
            <div className="sell-field">
              <label htmlFor={`${item.id}-title`}>Title</label>
              <input
                id={`${item.id}-title`}
                name="title"
                value={draft.title}
                onChange={(event) => update("title", event.target.value)}
                required
                minLength={3}
                maxLength={120}
              />
            </div>
            <div className="sell-field">
              <label htmlFor={`${item.id}-price`}>Price (KRW)</label>
              <input
                id={`${item.id}-price`}
                name="price"
                type="number"
                min={0}
                max={1000000000000}
                step={1}
                required
                value={draft.price}
                onChange={(event) => update("price", event.target.value)}
              />
            </div>
            <div className="sell-field">
              <label htmlFor={`${item.id}-condition`}>Condition</label>
              <select
                id={`${item.id}-condition`}
                name="condition"
                value={draft.condition}
                onChange={(event) => update("condition", event.target.value)}
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {conditionLabels[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sell-field">
              <label htmlFor={`${item.id}-category`}>Category</label>
              <select
                id={`${item.id}-category`}
                name="categoryId"
                value={draft.category_id}
                onChange={(event) =>
                  update("category_id", Number(event.target.value))
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sell-field">
              <label htmlFor={`${item.id}-area`}>Neighborhood</label>
              <select
                id={`${item.id}-area`}
                name="neighborhoodId"
                value={draft.neighborhood_id}
                onChange={(event) =>
                  update("neighborhood_id", Number(event.target.value))
                }
              >
                {neighborhoods.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sell-field">
              <label htmlFor={`${item.id}-description`}>Description</label>
              <textarea
                id={`${item.id}-description`}
                name="description"
                required
                minLength={10}
                maxLength={5000}
                value={draft.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </div>
            <p className="auth-hint">
              Your existing photos stay with this item.
            </p>
            <button
              className="button button-primary"
              name="intent"
              value="edit"
            >
              Save changes
            </button>
          </details>
          <div className="manage-actions">
            <button
              className="button button-outline"
              name="intent"
              value={item.status === "sold" ? "active" : "sold"}
              formNoValidate
            >
              {item.status === "sold" ? "Mark available" : "Mark sold"}
            </button>
          </div>
          <details>
            <summary>Remove item</summary>
            <p>This hides the item and its photos from the marketplace.</p>
            <label className="remove-confirm">
              <input name="confirm" type="checkbox" value="yes" /> Confirm
              removal of this item
            </label>
            <button
              className="button button-outline"
              name="intent"
              value="remove"
              formNoValidate
            >
              Remove item
            </button>
          </details>
        </fieldset>
        {pending && <p role="status">Saving…</p>}
        {result.error && (
          <p className="auth-error" role="alert">
            {result.error}
          </p>
        )}
        {result.message && <p role="status">{result.message}</p>}
      </form>
    </article>
  );
}

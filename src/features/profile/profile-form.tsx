"use client";
import { startTransition, useActionState, useState } from "react";
import { updateProfile } from "./actions";
export function ProfileForm({
  displayName,
  neighborhoodId,
  neighborhoods,
}: {
  displayName: string;
  neighborhoodId: number | null;
  neighborhoods: { id: number; name: string }[];
}) {
  const [name, setName] = useState(displayName);
  const [area, setArea] = useState(
    neighborhoodId === null ? "" : String(neighborhoodId),
  );
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("displayName", name);
        data.set("neighborhoodId", area);
        // Dispatch explicitly so a failed action does not reset the select's DOM value.
        startTransition(() => action(data));
      }}
      className="auth-form profile-form"
      aria-busy={pending}
    >
      <h2>Edit profile</h2>
      <fieldset disabled={pending}>
        <legend className="sr-only">Profile details</legend>
        <div className="sell-field">
          <label htmlFor="profile-name">Display name</label>
          <input
            id="profile-name"
            name="displayName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={80}
            autoComplete="nickname"
            aria-describedby="profile-name-help"
          />
          <p id="profile-name-help" className="auth-hint">
            Use 2–40 characters. This name appears on new listings and new
            conversations.
          </p>
        </div>
        <div className="sell-field">
          <label htmlFor="profile-neighborhood">Your neighborhood</label>
          <select
            id="profile-neighborhood"
            name="neighborhoodId"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            aria-describedby="profile-area-help"
          >
            <option value="">Not selected</option>
            {neighborhoods.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p id="profile-area-help" className="auth-hint">
            Optional. Share your neighborhood, not your exact address. This does
            not verify your location.
          </p>
        </div>
        <button className="button button-primary" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </fieldset>
      {state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="profile-success" role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}

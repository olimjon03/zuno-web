"use client";
import { startTransition, useActionState, useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { updateProfile } from "./actions";
export function ProfileForm({
  displayName,
  email,
  neighborhoodId,
  neighborhoods,
}: {
  displayName: string;
  email: string;
  neighborhoodId: number | null;
  neighborhoods: { id: number; name: string }[];
}) {
  const [name, setName] = useState(displayName);
  const [area, setArea] = useState(
    neighborhoodId === null ? "" : String(neighborhoodId),
  );
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState({name: displayName, area: neighborhoodId === null ? "" : String(neighborhoodId)});
  const [showResult, setShowResult] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (window.location.hash === "#profile-neighborhood") setEditing(true); });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (editing) nameInput.current?.focus(); }, [editing]);
  const [state, action, pending] = useActionState(async (previous: Awaited<ReturnType<typeof updateProfile>>, data: FormData) => {
    const result = await updateProfile(previous, data);
    setShowResult(true);
    if (result.message) {
      setSaved({name: String(data.get("displayName")), area: String(data.get("neighborhoodId"))});
      setEditing(false);
    }
    return result;
  }, {});
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
      {!editing ? <>
        <dl className="settings-facts"><div><dt><Icon name="user"/>Display name</dt><dd>{saved.name}</dd></div><div><dt><Icon name="mail"/>Email</dt><dd>{email || "Not shared"}</dd></div><div><dt><Icon name="pin"/>Neighborhood</dt><dd>{neighborhoods.find(item=>String(item.id)===saved.area)?.name || "Not selected"}</dd></div></dl>
        <button type="button" className="button button-primary" onClick={()=>{setName(saved.name);setArea(saved.area);setShowResult(false);setEditing(true);}}>Edit profile</button>
      </> : <fieldset disabled={pending}>
        <legend className="sr-only">Profile details</legend>
        <div className="sell-field">
          <label htmlFor="profile-name">Display name</label>
          <input
            ref={nameInput}
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
        <div className="settings-edit-actions"><button type="button" className="button button-outline" disabled={pending} onClick={()=>{setName(saved.name);setArea(saved.area);setEditing(false);setShowResult(false);}}>Cancel</button>
        <button className="button button-primary" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </button></div>
      </fieldset>}
      {showResult && state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}
      {showResult && state.message && (
        <p className="profile-success" role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}

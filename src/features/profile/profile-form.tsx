"use client";
import { startTransition, useActionState, useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { NeighborhoodFields } from "./neighborhood-fields";
import { profileAreaCountry } from "./location";
import type { ProfileNeighborhood, ProfileState } from "./types";
import type { CountryCode } from "@/features/locations/catalog";
import { updateProfile, updateNeighborhood } from "./server/actions";
export function ProfileForm({
  displayName,
  email,
  neighborhoodId,
  neighborhoods,
}: {
  displayName: string;
  email: string;
  neighborhoodId: number | null;
  neighborhoods: ProfileNeighborhood[];
}) {
  const [name, setName] = useState(displayName);
  const [area, setArea] = useState(
    neighborhoodId === null ? "" : String(neighborhoodId),
  );
  const [mode, setMode] = useState<"profile" | "neighborhood" | null>(null);
  const [country, setCountry] = useState<CountryCode | "">(() => profileAreaCountry(neighborhoods, neighborhoodId === null ? "" : String(neighborhoodId)));
  const countryInput = useRef<HTMLSelectElement>(null);
  const [saved, setSaved] = useState({name: displayName, area: neighborhoodId === null ? "" : String(neighborhoodId)});
  const [showResult, setShowResult] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const openNeighborhood = () => { if (window.location.hash === "#profile-neighborhood") setMode("neighborhood"); };
    const frame = requestAnimationFrame(openNeighborhood);
    window.addEventListener("hashchange", openNeighborhood);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", openNeighborhood); };
  }, []);
  useEffect(() => { if (mode === "profile") nameInput.current?.focus(); else if (mode === "neighborhood") countryInput.current?.focus(); }, [mode]);
  const [state, action, pending] = useActionState(async (previous: ProfileState, data: FormData) => {
    const result = await (data.get("intent") === "neighborhood" ? updateNeighborhood(previous, data) : updateProfile(previous, data));
    setShowResult(true);
    if (result.profile) {
      setSaved({name: result.profile.displayName, area: result.profile.neighborhoodId === null ? "" : String(result.profile.neighborhoodId)});
      setMode(null);
    }
    if (result.neighborhoodId !== undefined) {
      setSaved(current => ({ ...current, area: String(result.neighborhoodId) }));
      setMode(null);
    }
    return result;
  }, {});
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("intent", mode ?? "profile");
        if (mode === "profile") data.set("displayName", name);
        data.set("neighborhoodId", area);
        // Dispatch explicitly so a failed action does not reset the select's DOM value.
        startTransition(() => action(data));
      }}
      className="auth-form profile-form"
      aria-busy={pending}
    >
      {!mode ? <>
        <dl className="settings-facts"><div><dt><Icon name="user"/>Display name</dt><dd>{saved.name}</dd></div><div><dt><Icon name="mail"/>Email</dt><dd>{email || "Not shared"}</dd></div><div><dt><Icon name="pin"/>Neighborhood</dt><dd>{neighborhoods.find(item=>String(item.id)===saved.area)?.name || "Not selected"}</dd></div></dl>
        <button type="button" className="button button-primary" onClick={()=>{setName(saved.name);setArea(saved.area);setCountry(profileAreaCountry(neighborhoods, saved.area));setShowResult(false);setMode("profile");}}>Edit profile</button><button type="button" className="button button-outline" onClick={()=>{setArea(saved.area);setCountry(profileAreaCountry(neighborhoods,saved.area));setShowResult(false);setMode("neighborhood");}}>Change neighborhood</button>
      </> : <fieldset disabled={pending}>
        <legend className="sr-only">{mode === "neighborhood" ? "Change neighborhood" : "Profile details"}</legend>
        {mode === "profile" && <div className="sell-field">
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
        </div>}
        <NeighborhoodFields country={country} area={area} options={neighborhoods} required={mode === "neighborhood"} onCountry={setCountry} onArea={setArea} countryRef={countryInput}/>
        <div className="settings-edit-actions"><button type="button" className="button button-outline" disabled={pending} onClick={()=>{setName(saved.name);setArea(saved.area);setMode(null);setShowResult(false);}}>Cancel</button>
        <button className="button button-primary" disabled={pending}>
          {pending ? "Saving…" : mode === "neighborhood" ? "Save neighborhood" : "Save profile"}
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

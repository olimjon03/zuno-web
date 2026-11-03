"use client";
import { useCountry, notifyCountryChange } from "@/features/locations/country-provider";
import { Text } from "@/features/language/provider";

import { startTransition, useActionState, useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { NeighborhoodFields } from "./neighborhood-fields";
import { profileAreaCountry } from "./location";
import type { ProfileNeighborhood, ProfileState } from "./types";
import type { CountryCode } from "@/features/locations/catalog";
import { EmailForm } from "./email-form";
import { updateDisplayName, updateNeighborhood } from "./server/actions";
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
  const selectedCountry=useCountry();
  const [name, setName] = useState(displayName);
  const [area, setArea] = useState(
    neighborhoodId === null ? "" : String(neighborhoodId),
  );
  const [returnToProfile, setReturnToProfile] = useState(false);
  const [mode, setMode] = useState<"profile" | "neighborhood" | null>(null);
  const [country, setCountry] = useState<CountryCode | "">(() => profileAreaCountry(neighborhoods, neighborhoodId === null ? "" : String(neighborhoodId)));
  const countryInput = useRef<HTMLSelectElement>(null);
  const [saved, setSaved] = useState({name: displayName, area: neighborhoodId === null ? "" : String(neighborhoodId)});
  const [showResult, setShowResult] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const openNeighborhood = () => { if (window.location.hash === "#profile-neighborhood") { setReturnToProfile(false); setCountry(current=>current||selectedCountry); setMode("neighborhood"); } };
    const frame = requestAnimationFrame(openNeighborhood);
    window.addEventListener("hashchange", openNeighborhood);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", openNeighborhood); };
  }, [selectedCountry]);
  useEffect(() => { if (mode === "profile") nameInput.current?.focus(); else if (mode === "neighborhood") countryInput.current?.focus(); }, [mode]);
  const [state, action, pending] = useActionState(async (previous: ProfileState, data: FormData) => {
    const result = await (data.get("intent") === "neighborhood" ? updateNeighborhood(previous, data) : updateDisplayName(previous, data));
    setShowResult(true);
    const savedName = result.displayName;
    if (savedName) { setSaved(current => ({...current, name: savedName})); setMode(null); }
    if (result.neighborhoodId !== undefined) {
      notifyCountryChange();
      setSaved(current => ({...current, area: String(result.neighborhoodId)}));
      setMode(returnToProfile ? "profile" : null);
    }
    return result;
  }, {});
  const areaName = neighborhoods.find(item => String(item.id) === saved.area)?.name || "Not selected";
  function openNeighborhood(fromProfile: boolean) {
    setReturnToProfile(fromProfile);setArea(saved.area);setCountry(selectedCountry || profileAreaCountry(neighborhoods,saved.area));setShowResult(false);setMode("neighborhood");
  }
  function submit(event: React.FormEvent<HTMLFormElement>, intent: "name" | "neighborhood") {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("intent", intent);
    if (intent === "name") data.set("displayName", name);
    else data.set("neighborhoodId", area);
    startTransition(() => action(data));
  }
  return <div className="auth-form profile-form">
    {!mode && <>
      <dl className="settings-facts"><div><dt><Icon name="user"/><Text>{"Display name"}</Text></dt><dd>{saved.name}</dd></div><div><dt><Icon name="mail"/><Text>{"Email"}</Text></dt><dd>{email || <Text>{"Not shared"}</Text>}</dd></div><div><dt><Icon name="pin"/><Text>{"Neighborhood"}</Text></dt><dd>{areaName}</dd></div></dl>
      <button type="button" className="button button-primary" onClick={()=>{setName(saved.name);setShowResult(false);setMode("profile");}}><Text>{"Edit profile"}</Text></button>
      <button type="button" className="button button-outline" onClick={()=>openNeighborhood(false)}><Text>{"Change neighborhood"}</Text></button>
    </>}
    <div hidden={mode !== "profile"}>
      <form id="profile-name-form" className="auth-form" aria-busy={pending} onSubmit={event=>submit(event,"name")}>
        <div className="sell-field"><label htmlFor="profile-name"><Text>{"Display name"}</Text></label><input ref={nameInput} id="profile-name" name="displayName" value={name} onChange={event=>setName(event.target.value)} required minLength={2} maxLength={80} autoComplete="nickname" disabled={pending}/><p className="auth-hint"><Text>{"Use 2–40 characters. Save profile updates your display name."}</Text></p></div>
      </form>
      <EmailForm email={email}/>
      <div className="sell-field"><p><strong><Text>{"Neighborhood"}</Text></strong></p><p>{areaName}</p><button type="button" className="button button-outline" disabled={pending} onClick={()=>openNeighborhood(true)}><Text>{"Change neighborhood"}</Text></button></div>
      <div className="settings-edit-actions"><button type="button" className="button button-outline" disabled={pending} onClick={()=>{setMode(null);setShowResult(false);}}><Text>{"Cancel"}</Text></button><button form="profile-name-form" className="button button-primary" disabled={pending}>{pending ? <Text>{"Saving…"}</Text> : <Text>{"Save profile"}</Text>}</button></div>
    </div>
    {mode === "neighborhood" && <form className="auth-form" aria-busy={pending} onSubmit={event=>submit(event,"neighborhood")}>
      <fieldset disabled={pending}><legend className="sr-only"><Text>{"Change neighborhood"}</Text></legend><NeighborhoodFields country={country} area={area} options={neighborhoods} required onCountry={setCountry} onArea={setArea} countryRef={countryInput} allowCountry={!returnToProfile}/><div className="settings-edit-actions"><button type="button" className="button button-outline" disabled={pending} onClick={()=>{setMode(returnToProfile ? "profile" : null);setShowResult(false);}}><Text>{"Cancel"}</Text></button><button className="button button-primary" disabled={pending}>{pending ? <Text>{"Saving…"}</Text> : <Text>{"Save neighborhood"}</Text>}</button></div></fieldset>
    </form>}
    {showResult && state.error && <p className="auth-error" role="alert"><Text>{state.error}</Text></p>}
    {showResult && state.message && <p className="profile-success" role="status"><Text>{state.message}</Text></p>}
  </div>;
}

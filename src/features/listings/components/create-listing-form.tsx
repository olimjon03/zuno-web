"use client";
import { PriceInput } from "./price-input";
import { Text, useT } from "@/features/language/provider";

import { MeetingPointPicker, type MeetingPoint } from "./meeting-point-picker";
import Link from "next/link";
import { useLocation } from "@/features/locations/location-provider";
import { useCountry } from "@/features/locations/country-provider";
import type { CountryCode } from "@/features/locations/catalog";
import { priceLabel } from "../currency";
import { preparePhotos } from "../client/prepare-photos";
import { PhotoPicker, type PhotoChoice } from "./photo-picker";
import { ListingLocationFields } from "./listing-location-fields";
import { useRef, useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { conditionLabels, conditions } from "../constants";
import { isUuid, validatePhotos } from "../validation";
import type { LookupOption } from "../types";
export function CreateListingForm({
  categories,
  neighborhoods,
  ready,
}: {
  categories: LookupOption[];
  neighborhoods: LookupOption[];
  ready: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoChoice[]>([]);
  const {location}=useLocation();
  const selectedCountry=useCountry();
  const country:CountryCode|""=selectedCountry || location.country;
  const [meetingSelection, setMeetingSelection] = useState<{country:string;point:MeetingPoint|null}>({country:"",point:null});
  const meetingPoint = meetingSelection.country === country ? meetingSelection.point : null;
  const setMeetingPoint = useCallback((point:MeetingPoint|null) => setMeetingSelection({country,point}), [country]);
  const [neighborhoodId,setNeighborhoodId]=useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const issue = validatePhotos(photos.map(photo=>photo.file!));
    if (issue) {
      setError(issue);
      return;
    }
    const data = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    data.set("id", requestId.current);

    submitting.current = true;
    setPending(true);
    setError("");
    setNeedsLogin(false);
    try {
      for (const photo of await preparePhotos(photos.map(photo=>photo.file!))) data.append("photos",photo);
      const response = await fetch("/api/listings", {
        method: "POST",
        body: data,
      });
      let result;
      try { result = await response.json(); } catch { throw new Error("We couldn’t reach the marketplace. Please try again."); }
      if (!result || typeof result !== "object") throw new Error("We couldn’t confirm the listing. Please try again.");
      if (!response.ok) {
        setNeedsLogin(response.status === 401);
        throw new Error(
          typeof result.error === "string" ? result.error : "Please try again.",
        );
      }
      if (typeof result.id !== "string" || !isUuid(result.id))
        throw new Error("We couldn’t confirm the listing. Please try again.");
      router.push(`/listings/${result.id}`);
      router.refresh();
    } catch (issue) {
      setError(
        issue instanceof TypeError
          ? "We couldn’t reach the marketplace. Please check your connection and try again."
          : issue instanceof Error
          ? issue.message
          : "We couldn’t publish your item. Please try again.",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <form
      className="sell-form"
      onSubmit={submit}
      onChange={() => {
        if (!submitting.current) requestId.current = null;
      }}
      aria-busy={pending}
    >
      {!ready && (
        <p role="status" className="auth-error">
          <Text>{"Posting is being prepared. Please try again later."}</Text></p>
      )}
      <fieldset disabled={pending}>
        <legend className="sr-only"><Text>{"Item details and photos"}</Text></legend>
        <div className="sell-field">
          <label htmlFor="listing-title"><Text>{"Title"}</Text></label>
          <input
            id="listing-title"
            name="title"
            required
            minLength={3}
            maxLength={120}
            placeholder={t("What are you selling?")}
          />
        </div>
        <div className="sell-fields">
          <div className="sell-field">
            <label htmlFor="listing-price"><Text>{"Price ("}</Text>{priceLabel(country)})</label>
            <PriceInput id="listing-price"/>
            <p className="auth-hint"><Text>{"Use 0 if you’re giving it away. Currency follows the selected country; amounts are not converted."}</Text></p>
          </div>
          <div className="sell-field">
            <label htmlFor="listing-condition"><Text>{"Condition"}</Text></label>
            <select
              id="listing-condition"
              name="condition"
              required
              defaultValue=""
            >
              <option value="" disabled>
                <Text>{"Choose condition"}</Text></option>
              {conditions.map((value) => (
                <option key={value} value={value}>
                  <Text>{conditionLabels[value]}</Text>
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="sell-fields">
          <div className="sell-field">
            <label htmlFor="listing-category"><Text>{"Category"}</Text></label>
            <select
              id="listing-category"
              name="categoryId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                <Text>{"Choose category"}</Text></option>
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  <Text>{option.name}</Text>
                </option>
              ))}
            </select>
          </div>
        </div>
        <ListingLocationFields id="create" country={country} neighborhoodId={neighborhoodId} options={neighborhoods} onNeighborhood={value => { setNeighborhoodId(value); setMeetingPoint(null); }}/>
        <MeetingPointPicker key={`${country}-${neighborhoodId}`} country={country} value={meetingPoint} onChange={setMeetingPoint}/>
        <div className="sell-field">
          <label htmlFor="listing-description"><Text>{"Description"}</Text></label>
          <textarea
            id="listing-description"
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            placeholder={t("Mention its condition, what’s included, and pickup arrangements.")}
          />
          <p className="auth-hint">
            <Text>{"Share your neighborhood, not your home address or phone number."}</Text></p>
        </div>
        <PhotoPicker id="listing-photos" photos={photos} onChange={value=>{setPhotos(value);requestId.current=null;}} onError={setError} disabled={pending}/>
      </fieldset>
      {error && (
        <p role="alert" className="auth-error">
          <Text>{error}</Text>
        </p>
      )}
      {needsLogin && (
        <Link href="/login" className="button button-outline">
          <Text>{"Log in again"}</Text></Link>
      )}
      <p className="auth-hint">
        <Text>{"Your listing and photos will be visible to other visitors when published."}</Text></p>
      <button className="button button-primary" disabled={pending || !ready}>
        {pending ? <Text>{"Publishing your item…"}</Text> : <Text>{"Publish item"}</Text>}
      </button>
      <p role="status" className="auth-hint">
        {pending
          ? <Text>{"Uploading photos and saving your listing. Please keep this page open."}</Text>
          : ""}
      </p>
    </form>
  );
}

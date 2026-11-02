"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { conditionLabels, conditions, isUuid, validatePhotos } from "../validation";
import type { LookupOption } from "../server/data";
function PhotoPreview({ file }: { file: File }) {
  const preview = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (preview.current) preview.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    // Object URLs exist only in the browser and must be recreated after effect cleanup.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={preview} alt={`Preview of ${file.name}`} width={180} height={140} />
  );
}
export function CreateListingForm({
  categories,
  neighborhoods,
  ready,
}: {
  categories: LookupOption[];
  neighborhoods: LookupOption[];
  ready: boolean;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const issue = validatePhotos(photos);
    if (issue) {
      setError(issue);
      return;
    }
    const data = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    data.set("id", requestId.current);
    for (const photo of photos) data.append("photos", photo);
    submitting.current = true;
    setPending(true);
    setError("");
    setNeedsLogin(false);
    try {
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
          Posting is being prepared. Please try again later.
        </p>
      )}
      <fieldset disabled={pending}>
        <legend className="sr-only">Item details and photos</legend>
        <div className="sell-field">
          <label htmlFor="listing-title">Title</label>
          <input
            id="listing-title"
            name="title"
            required
            minLength={3}
            maxLength={120}
            placeholder="What are you selling?"
          />
        </div>
        <div className="sell-fields">
          <div className="sell-field">
            <label htmlFor="listing-price">Price (KRW)</label>
            <input
              id="listing-price"
              name="price"
              type="number"
              inputMode="numeric"
              required
              min={0}
              max={1000000000000}
              step={1}
              placeholder="0"
            />
            <p className="auth-hint">Use 0 if you’re giving it away.</p>
          </div>
          <div className="sell-field">
            <label htmlFor="listing-condition">Condition</label>
            <select
              id="listing-condition"
              name="condition"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose condition
              </option>
              {conditions.map((value) => (
                <option key={value} value={value}>
                  {conditionLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="sell-fields">
          <div className="sell-field">
            <label htmlFor="listing-category">Category</label>
            <select
              id="listing-category"
              name="categoryId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose category
              </option>
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sell-field">
            <label htmlFor="listing-neighborhood">Neighborhood</label>
            <select
              id="listing-neighborhood"
              name="neighborhoodId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose neighborhood
              </option>
              {neighborhoods.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="sell-field">
          <label htmlFor="listing-description">Description</label>
          <textarea
            id="listing-description"
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            placeholder="Mention its condition, what’s included, and pickup arrangements."
          />
          <p className="auth-hint">
            Share your neighborhood, not your home address or phone number.
          </p>
        </div>
        <div className="sell-field">
          <label htmlFor="listing-photos">Photos</label>
          <p id="photo-help" className="auth-hint">
            Choose 1–3 JPG, PNG or WebP photos. Up to 2 MB each and 3.5 MB
            combined. The first photo is the cover.
          </p>
          <input
            id="listing-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-describedby="photo-help"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              const issue = validatePhotos(selected);
              if (issue) setError(issue);
              else {
                setPhotos(selected);
                setError("");
              }
              event.target.value = "";
            }}
          />
          <div className="upload-previews">
            {photos.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${index}`}>
                <PhotoPreview file={file} />
                <button
                  type="button"
                  onClick={() => {
                    setPhotos((current) =>
                      current.filter((_, i) => i !== index),
                    );
                    requestId.current = null;
                  }}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  Remove photo {index + 1}
                </button>
              </div>
            ))}
          </div>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
      {needsLogin && (
        <Link href="/login" className="button button-outline">
          Log in again
        </Link>
      )}
      <p className="auth-hint">
        Your listing and photos will be visible to other visitors when
        published.
      </p>
      <button className="button button-primary" disabled={pending || !ready}>
        {pending ? "Publishing your item…" : "Publish item"}
      </button>
      <p role="status" className="auth-hint">
        {pending
          ? "Uploading photos and saving your listing. Please keep this page open."
          : ""}
      </p>
    </form>
  );
}

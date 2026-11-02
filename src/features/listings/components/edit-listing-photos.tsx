"use client";
import { useState, useRef, useImperativeHandle, type Ref } from "react";
import { useRouter } from "next/navigation";
import { PhotoPicker, type PhotoChoice } from "./photo-picker";
import { preparePhotos } from "../prepare-photos";
export type ListingPhoto = { id: string; sort_order: number };
export type PhotoEditorHandle = {
  validate: () => string | null;
  save: () => Promise<{ error?: string }>;
};
export function EditListingPhotos({ listingId, initial, disabled, ref }: {
  listingId: string;
  initial: ListingPhoto[];
  disabled: boolean;
  ref: Ref<PhotoEditorHandle>;
}) {
  const router = useRouter();
  const busy = useRef(false);
  const ordered = [...initial].sort((a, b) => a.sort_order - b.sort_order);
  const [photos, setPhotos] = useState<PhotoChoice[]>(() => ordered.map(photo => ({
    id: photo.id, src: `/listing-photos/${photo.id}`,
  })));
  const [error, setError] = useState("");
  useImperativeHandle(ref, () => ({
    validate() {
      const issue = photos.length ? null : "Keep at least one photo.";
      setError(issue ?? "");
      return issue;
    },
    async save() {
      if (busy.current) return { error: "Photos are still saving. Please wait." };
      if (!photos.length) return { error: "Keep at least one photo." };
      if (photos.length === ordered.length && photos.every((photo, i) => !photo.file && photo.id === ordered[i].id)) return {};
      busy.current = true;
      setError("");
      try {
        const form = new FormData();
        let index = 0;
        form.set("order", JSON.stringify(photos.map(photo => photo.file ? `new:${index++}` : photo.id)));
        form.set("expected", JSON.stringify(ordered.map(photo => photo.id)));
        for (const file of await preparePhotos(photos.flatMap(photo => photo.file ? [photo.file] : []))) form.append("photos", file);
        const response = await fetch(`/api/listings/${listingId}/photos`, { method: "PATCH", body: form });
        const result = await response.json();
        if (!response.ok) throw Error(result.error || "Could not save photos.");
        router.refresh();
        return {};
      } catch (issue) {
        const message = issue instanceof Error ? issue.message : "Could not save photos. Please try again.";
        setError(message);
        return { error: message };
      } finally {
        busy.current = false;
      }
    },
  }));
  return <section className="owned-photo-editor" aria-label="Item photos">
    <PhotoPicker id={`photos-${listingId}`} photos={photos} onChange={setPhotos} onError={setError} disabled={disabled} compact/>
    {error && <p role="alert" className="auth-error">{error}</p>}
  </section>;
}

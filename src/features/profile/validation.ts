import type { ProfileInput } from "./types";
export function parseProfile(data: FormData): ProfileInput {
  const name = data.get("displayName");
  const area = data.get("neighborhoodId");
  if (
    typeof name !== "string" ||
    Array.from(name.trim()).length < 2 ||
    Array.from(name.trim()).length > 40
  )
    throw new Error("Choose a display name between 2 and 40 characters.");
  if (
    typeof area !== "string" ||
    (area !== "" &&
      (!/^[1-9]\d*$/.test(area) || !Number.isSafeInteger(Number(area))))
  )
    throw new Error("Choose a neighborhood from the list.");
  return {
    displayName: name.trim(),
    neighborhoodId: area === "" ? null : Number(area),
  };
}

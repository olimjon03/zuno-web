import type { Geometry } from "geojson";
import { districts } from "./districts";

export type AreaBoundaries = { region: Geometry; districts: Record<string, Geometry> };
export function selectAreaBoundary(data: AreaBoundaries, location: {
  regionCode?: string; districtCode?: string; neighborhood: string;
}) {
  // Legacy rows have names only. Accept a unique exact match within their region.
  const candidates = districts.filter(d => d.regionCode === location.regionCode &&
    (d.name === location.neighborhood || d.english === location.neighborhood));
  const code = location.districtCode ?? (candidates.length === 1 ? candidates[0].code : undefined);
  const geometry = code && data.districts[code];
  return { geometry: geometry || data.region, district: Boolean(geometry) };
}

"use client";
import { useEffect, useRef, useState } from "react";
import { Text } from "@/features/language/provider";
import { regions } from "@/features/locations/catalog";
import { selectAreaBoundary, type AreaBoundaries } from "@/features/locations/area-boundary";
import "leaflet/dist/leaflet.css";

type Props = { regionCode?: string; districtCode?: string; neighborhood: string };
export function ListingAreaMap({ regionCode, districtCode, neighborhood }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Loading map…");
  useEffect(() => {
    const abort = new AbortController();
    let dispose: (() => void) | undefined;
    const known = Object.values(regions).flat().some(region => region.code === regionCode);
    if (!known) return;
    Promise.all([
      import("leaflet"),
      fetch(`/maps/areas/${regionCode}.json`, { signal: abort.signal }).then(response => {
        if (!response.ok) throw new Error("Boundary unavailable");
        return response.json() as Promise<AreaBoundaries>;
      }),
    ]).then(([L, data]) => {
      if (abort.signal.aborted || !container.current) return;
      const selected = selectAreaBoundary(data, { regionCode, districtCode, neighborhood });
      const map = L.map(container.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://www.geoboundaries.org/">geoBoundaries</a>',
        maxZoom: 19,
      }).addTo(map);
      // Fill the entire polygon, including correct holes/islands, not just its outline.
      const layer = L.geoJSON(selected.geometry, { style: {
        color: "#007f73", weight: 2, fillColor: "#00a893", fillOpacity: 0.28,
      } }).addTo(map);
      map.fitBounds(layer.getBounds(), { padding: [18, 18], maxZoom: 14 });
      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container.current);
      dispose = () => { observer.disconnect(); map.remove(); };
      setStatus(selected.district ? "The shaded area is the listing’s district, not an exact meeting point." :
        "District boundary unavailable. The shaded area shows the wider region, not an exact meeting point.");
    }).catch(() => { if (!abort.signal.aborted) setStatus("Map unavailable. Please use the area name or open the map below."); });
    return () => { abort.abort(); dispose?.(); };
  }, [regionCode, districtCode, neighborhood]);
  const known = Object.values(regions).flat().some(region => region.code === regionCode);
  return <>
    {known && <div ref={container} role="region" aria-label="Listing area map" style={{ height: 300, width: "100%", borderRadius: 16, overflow: "hidden", position: "relative", zIndex: 0 }} />}
    <p role="status"><Text>{known ? status : "Map unavailable. Please use the area name or open the map below."}</Text></p>
  </>;
}

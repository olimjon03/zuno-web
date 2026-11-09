"use client";
import { Text } from "@/features/language/provider";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, CircleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { kakaoMapEnabled, loadKakaoMaps, mountKakaoPointMap } from "./kakao-map";

import { loadYandexMaps, mountYandexPointMap, yandexMapEnabled } from "./yandex-map";

export type MeetingPoint = { lat: number; lng: number };
export function MeetingPointPicker({ country, value, onChange }: {
  country: string; value: MeetingPoint | null; onChange: (point: MeetingPoint | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const providerMap = useRef<ReturnType<typeof mountKakaoPointMap> | null>(null);
  const marker = useRef<CircleMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const mountLeaflet = () => import("leaflet").then(L => {
      if (cancelled || !container.current) return;
      const instance = L.map(container.current).setView(country === "UZ" ? [41.31, 69.24] : [37.56, 126.98], 7);
      map.current = instance;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(instance);
      marker.current = L.circleMarker([0, 0], { radius: 10, color: "#007f73", fillColor: "#00a893", fillOpacity: 0.8 });
      instance.on("click", event => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }));
      observer = new ResizeObserver(() => instance.invalidateSize());
      observer.observe(container.current);
      setReady(true);
    }).catch(() => {
      if (!cancelled) setError("Map unavailable. Enter coordinates below or try again later.");
    });
    const useYandex = country === "UZ" && yandexMapEnabled;
    const mount = useYandex
      ? loadYandexMaps().then(maps => mountYandexPointMap.bind(null, maps))
      : country === "KR" && kakaoMapEnabled
        ? loadKakaoMaps().then(maps => mountKakaoPointMap.bind(null, maps))
        : null;
    if (mount) {
      void mount.then(mountPoint => {
        if (cancelled || !container.current) return;
        providerMap.current = mountPoint(container.current, useYandex ? { lat: 41.31, lng: 69.24 } : { lat: 37.56, lng: 126.98 }, onChange);
        setReady(true);
      }).catch(mountLeaflet);
    } else {
      void mountLeaflet();
    }
    return () => { cancelled = true; providerMap.current?.dispose(); providerMap.current = null; observer?.disconnect(); map.current?.remove(); map.current = null; marker.current = null; };
  }, [country, onChange]);
  useEffect(() => {
    if (!ready) return;
    const point = value && Number.isFinite(value.lat) && Number.isFinite(value.lng)
      && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180 ? value : null;
    if (providerMap.current) { providerMap.current.setPoint(point); return; }
    if (!map.current || !marker.current) return;
    if (!point) { marker.current.remove(); return; }
    marker.current.setLatLng([point.lat, point.lng]).addTo(map.current);
    map.current.setView([point.lat, point.lng], Math.max(map.current.getZoom(), 14));
  }, [value, ready]);

  return <fieldset style={{ border: 0, padding: 0, minWidth: 0 }}>
    <legend><Text>{"Meeting location on map (optional)"}</Text></legend>
    <p className="auth-hint"><Text>{"Zoom in and select a public meeting place. This pin will be visible to everyone."}</Text></p>
    <div ref={container} aria-label="Meeting location map" style={{ height: 300, width: "100%", borderRadius: 16, overflow: "hidden", position: "relative", zIndex: 0 }}/>
    {error && <p role="alert">{error}</p>}
    <button type="button" className="button button-outline" onClick={() => {
      if (!navigator.geolocation) { setError("Location is unavailable. Select a point on the map."); return; }
      navigator.geolocation.getCurrentPosition(position => {
        onChange({lat:position.coords.latitude,lng:position.coords.longitude}); setError("");
      }, () => setError("Location access was denied. Select a point on the map."));
    }}><Text>{"Use current location"}</Text></button>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,marginTop:12}}>
      <label style={{minWidth:0}}><Text>{"Latitude"}</Text><input style={{width:"100%",minWidth:0}} name="meetingLat" type="number" min={-90} max={90} step="any" value={value?.lat ?? ""}
        onChange={event => onChange(event.target.value === "" ? null : {lat:Number(event.target.value),lng:value?.lng ?? (country==="UZ"?69.24:126.98)})}/></label>
      <label style={{minWidth:0}}><Text>{"Longitude"}</Text><input style={{width:"100%",minWidth:0}} name="meetingLng" type="number" min={-180} max={180} step="any" value={value?.lng ?? ""}
        onChange={event => onChange(event.target.value === "" ? null : {lng:Number(event.target.value),lat:value?.lat ?? (country==="UZ"?41.31:37.56)})}/></label>
    </div>
    {value && <button type="button" className="button button-outline" onClick={() => onChange(null)}><Text>{"Remove map pin"}</Text></button>}
  </fieldset>;
}

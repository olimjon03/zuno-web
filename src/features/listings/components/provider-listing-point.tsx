"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMaps, mountKakaoPointMap } from "./kakao-map";

import { loadYandexMaps, mountYandexPointMap } from "./yandex-map";

export function ProviderListingPoint({ provider, lat, lng, fallback }: { provider: "kakao" | "yandex"; lat: number; lng: number; fallback: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    const mount = provider === "yandex"
      ? loadYandexMaps().then(maps => mountYandexPointMap.bind(null, maps))
      : loadKakaoMaps().then(maps => mountKakaoPointMap.bind(null, maps));
    mount.then(mountPoint => {
      if (!active || !container.current) return;
      const point = { lat, lng };
      const map = mountPoint(container.current, point);
      dispose = map.dispose;
      map.setPoint(point);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; dispose?.(); };
  }, [provider, lat, lng]);

  if (failed) return fallback;
  return <div ref={container} role="region" aria-label="Meeting location map"
    style={{ width: "100%", height: 300, borderRadius: 16, overflow: "hidden" }} />;
}

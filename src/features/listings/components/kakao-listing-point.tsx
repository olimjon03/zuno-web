"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMaps, mountKakaoPointMap } from "./kakao-map";

export function KakaoListingPoint({ lat, lng, fallback }: { lat: number; lng: number; fallback: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    loadKakaoMaps().then(maps => {
      if (!active || !container.current) return;
      const point = { lat, lng };
      const map = mountKakaoPointMap(maps, container.current, point);
      dispose = map.dispose;
      map.setPoint(point);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; dispose?.(); };
  }, [lat, lng]);

  if (failed) return fallback;
  return <div ref={container} role="region" aria-label="Meeting location map"
    style={{ width: "100%", height: 300, borderRadius: 16, overflow: "hidden" }} />;
}

type LatLng = { getLat(): number; getLng(): number };
type MapInstance = {
  relayout(): void;
  setCenter(point: LatLng): void;
  setLevel(level: number): void;
  getLevel(): number;
};
type Marker = { setMap(map: MapInstance | null): void; setPosition(point: LatLng): void };
type Click = (event: { latLng: LatLng }) => void;
type Maps = {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  Map: new (element: HTMLElement, options: { center: LatLng; level: number; scrollwheel?: boolean }) => MapInstance;
  Marker: new (options: { position: LatLng }) => Marker;
  event: {
    addListener(map: MapInstance, name: "click", callback: Click): void;
    removeListener(map: MapInstance, name: "click", callback: Click): void;
  };
};

const key = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY;
export const kakaoMapEnabled = Boolean(key);
let pending: Promise<Maps> | undefined;

export function loadKakaoMaps() {
  if (!key) return Promise.reject(new Error("Kakao Maps key missing"));
  if (pending) return pending;
  pending = new Promise<Maps>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error("Kakao Maps unavailable"));
    };
    const timeout = window.setTimeout(fail, 8000);
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
    script.onerror = fail;
    script.onload = () => {
      const maps = (window as Window & { kakao?: { maps?: Maps } }).kakao?.maps;
      if (!maps?.load) { fail(); return; }
      maps.load(() => {
        clearTimeout(timeout);
        resolve(maps);
      });
    };
    document.head.appendChild(script);
  }).catch(error => { pending = undefined; throw error; });
  return pending;
}

export function mountKakaoPointMap(
  maps: Maps,
  container: HTMLElement,
  initial: { lat: number; lng: number },
  onPick?: (point: { lat: number; lng: number }) => void,
) {
  const center = new maps.LatLng(initial.lat, initial.lng);
  const map = new maps.Map(container, { center, level: onPick ? 9 : 4, scrollwheel: Boolean(onPick) });
  const marker = new maps.Marker({ position: center });
  const click: Click = ({ latLng }) => onPick?.({ lat: latLng.getLat(), lng: latLng.getLng() });
  if (onPick) maps.event.addListener(map, "click", click);
  const observer = new ResizeObserver(() => map.relayout());
  observer.observe(container);
  return {
    setPoint(point: { lat: number; lng: number } | null) {
      if (!point) { marker.setMap(null); return; }
      const position = new maps.LatLng(point.lat, point.lng);
      marker.setPosition(position);
      marker.setMap(map);
      map.setCenter(position);
      map.setLevel(Math.min(map.getLevel(), 4));
    },
    dispose() {
      observer.disconnect();
      if (onPick) maps.event.removeListener(map, "click", click);
      marker.setMap(null);
      container.replaceChildren();
    },
  };
}

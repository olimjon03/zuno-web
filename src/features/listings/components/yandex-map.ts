import type { Geometry } from "geojson";

type Coordinates = [number, number];
type Point = { lat: number; lng: number };
type Overlay = { geometry: { setCoordinates(point: Coordinates): void } };
type MapInstance = {
  events: { add(name: "click", callback: (event: { get(name: "coords"): Coordinates }) => void): void };
  geoObjects: { add(overlay: Overlay): void; remove(overlay: Overlay): void };
  container: { fitToViewport(): void };
  setCenter(point: Coordinates, zoom: number): void;
  setBounds(bounds: [Coordinates, Coordinates], options: { zoomMargin: number }): void;
  getZoom(): number;
  destroy(): void;
};
type Maps = {
  ready(callback: () => void, onError: () => void): void;
  Map: new (container: HTMLElement, state: {
    center: Coordinates; zoom: number; behaviors?: string[]; controls: string[];
  }) => MapInstance;
  Placemark: new (position: Coordinates) => Overlay;
  Polygon: new (rings: Coordinates[][], properties: object, options: {
    strokeColor: string; strokeWidth: number; fillColor: string; fillOpacity: number;
  }) => Overlay;
};

const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
export const yandexMapEnabled = Boolean(key);
let pending: Promise<Maps> | undefined;

export function loadYandexMaps() {
  if (!key) return Promise.reject(new Error("Yandex Maps key missing"));
  if (pending) return pending;
  pending = new Promise<Maps>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error("Yandex Maps unavailable"));
    };
    const timeout = window.setTimeout(fail, 8000);
    script.async = true;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=en_US`;
    script.onerror = fail;
    script.onload = () => {
      const maps = (window as Window & { ymaps?: Maps }).ymaps;
      if (!maps?.ready) { fail(); return; }
      maps.ready(() => {
        clearTimeout(timeout);
        resolve(maps);
      }, fail);
    };
    document.head.appendChild(script);
  }).catch(error => { pending = undefined; throw error; });
  return pending;
}

function mountMap(maps: Maps, container: HTMLElement, center: Coordinates, zoom: number, interactive: boolean) {
  const map = new maps.Map(container, {
    center, zoom, controls: ["zoomControl"],
    behaviors: interactive ? undefined : ["drag", "dblClickZoom", "multiTouch"],
  });
  const observer = new ResizeObserver(() => map.container.fitToViewport());
  observer.observe(container);
  return { map, dispose: () => { observer.disconnect(); map.destroy(); } };
}

export function mountYandexPointMap(maps: Maps, container: HTMLElement, initial: Point, onPick?: (point: Point) => void) {
  const center: Coordinates = [initial.lat, initial.lng];
  const { map, dispose } = mountMap(maps, container, center, onPick ? 7 : 15, Boolean(onPick));
  const marker = new maps.Placemark(center);
  let visible = false;
  if (onPick) map.events.add("click", event => {
    const [lat, lng] = event.get("coords");
    onPick({ lat, lng });
  });
  return {
    setPoint(point: Point | null) {
      if (!point) {
        if (visible) map.geoObjects.remove(marker);
        visible = false;
        return;
      }
      const position: Coordinates = [point.lat, point.lng];
      marker.geometry.setCoordinates(position);
      if (!visible) map.geoObjects.add(marker);
      visible = true;
      map.setCenter(position, Math.max(map.getZoom(), 14));
    },
    dispose,
  };
}

export function mountYandexAreaMap(maps: Maps, container: HTMLElement, geometry: Geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates]
    : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
  const first = polygons[0]?.[0]?.[0];
  if (!first) throw new Error("Area boundary unavailable");
  const { map, dispose } = mountMap(maps, container, [first[1], first[0]], 8, false);
  const bounds: [Coordinates, Coordinates] = [[Infinity, Infinity], [-Infinity, -Infinity]];
  for (const polygon of polygons) {
    const rings = polygon.map(ring => ring.map(([lng, lat]): Coordinates => {
      bounds[0] = [Math.min(bounds[0][0], lat), Math.min(bounds[0][1], lng)];
      bounds[1] = [Math.max(bounds[1][0], lat), Math.max(bounds[1][1], lng)];
      return [lat, lng];
    }));
    map.geoObjects.add(new maps.Polygon(rings, {}, {
      strokeColor: "#007f73", strokeWidth: 2, fillColor: "#00a893", fillOpacity: 0.28,
    }));
  }
  map.setBounds(bounds, { zoomMargin: 18 });
  return dispose;
}

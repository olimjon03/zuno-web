import { ProviderListingPoint } from "./provider-listing-point";
import { ListingAreaMap } from "./listing-area-map";
import { Text } from "@/features/language/provider";
import type { Listing } from "../types";
import { formatLocationLabel } from "@/features/locations/catalog";

export function ListingMeetingMap({listing}:{listing:Listing}) {
  const point = listing.meetingPoint;
  const area = formatLocationLabel(listing);
  const query = point ? `${point.lat},${point.lng}` : `${area}, ${listing.countryCode === "UZ" ? "Uzbekistan" : "South Korea"}`;
  const useKakao = listing.countryCode === "KR" && Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY);
  const useYandex = listing.countryCode === "UZ" && Boolean(process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY);
  const googleMap = <iframe title={`Meeting location — ${area}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
    src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`}
    style={{width:"100%",height:300,border:0,borderRadius:16}} allowFullScreen/>;
  const mapUrl = useKakao
    ? point
      ? `https://map.kakao.com/link/map/${encodeURIComponent(area)},${point.lat},${point.lng}`
      : `https://map.kakao.com/link/search/${encodeURIComponent(area)}`
    : useYandex
      ? `https://yandex.com/maps/?text=${encodeURIComponent(point ? query : area + ", Uzbekistan")}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return <section aria-label="Meeting area map">
    <h2><Text>{"Meeting location"}</Text></h2>
    <p>{area}</p>
    {!point && <p><Text>{"The seller has not selected a map pin. This map shows the listed area."}</Text></p>}
    {point ? (
      useKakao || useYandex ? <ProviderListingPoint provider={useYandex ? "yandex" : "kakao"} lat={point.lat} lng={point.lng} fallback={googleMap}/> : googleMap
    ) : <ListingAreaMap useKakao={useKakao} useYandex={useYandex} regionCode={listing.regionCode} districtCode={listing.districtCode} neighborhood={listing.neighborhood}/>}
    <a href={mapUrl} target="_blank" rel="noopener noreferrer"><Text>{"Open map"}</Text></a>
  </section>;
}

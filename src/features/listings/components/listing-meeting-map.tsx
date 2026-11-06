import { Text } from "@/features/language/provider";
import type { Listing } from "../types";
import { formatLocationLabel } from "@/features/locations/catalog";

export function ListingMeetingMap({listing}:{listing:Listing}) {
  const point = listing.meetingPoint;
  const area = formatLocationLabel(listing);
  const query = point ? `${point.lat},${point.lng}` : `${area}, ${listing.countryCode === "UZ" ? "Uzbekistan" : "South Korea"}`;
  return <section aria-label="Meeting area map">
    <h2><Text>{"Meeting location"}</Text></h2>
    <p>{area}</p>
    {!point && <p><Text>{"The seller has not selected a map pin. This map shows the listed area."}</Text></p>}
    <iframe title={`Meeting location — ${area}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${point?15:12}&output=embed`}
      style={{width:"100%",height:300,border:0,borderRadius:16}} allowFullScreen/>
    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer"><Text>{"Open map"}</Text></a>
  </section>;
}

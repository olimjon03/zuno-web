# Location data attribution

District catalog adapted from [Open Admin Data](https://openadmindata.org/), copyright 2026 jakkrapongt, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Sources: https://github.com/open-admin-data/uzbekistan-administrative-divisions and https://github.com/open-admin-data/south-korea-administrative-divisions (all-district.json, snapshot downloaded November 4, 2026 Asia/Seoul). Source district IDs are retained; parent IDs are mapped to ZUNO region codes. Coordinates and other unused fields are omitted. Sejong city is added as a single local choice because it has no second-level autonomous district.

This versioned catalog is a locality picker, not a legal/address verification service. Administrative names can change; refresh the source snapshot as part of a reviewed migration. Existing region-only locations and original Seoul neighborhoods remain available for legacy listings. No exact addresses or GPS coordinates are collected.

Corrections/additions to the snapshot: missing metropolitan districts (including repeated Jung/Dong/Seo/Nam/Buk names), Cheorwon, Incheon’s 2026 districts, and Gunwi’s Daegu parent. Primary reference lists: [Busan](https://www.busan.go.kr/eng/autonomous-districts), [Incheon](https://www.incheon.go.kr/en/EN010103), [Ulsan](https://www.ulsan.go.kr/u/english/contents.ulsan?mId=001001002005000000), [Daejeon](https://daejeon.go.kr/english/statistics.do?menuSeq=7022), [Korean government regional guide](https://www.gks.go.kr/ko/life/regionsIntro.do). Source district IDs are opaque internal identifiers; supplemental IDs are namespaced by ZUNO region.

Corrected abbreviated/mistranscribed Korean ward names using their English district identities: Dongan, Ilsandong/seo, Masanhappo/hoewon, Gwonseon, Seongsan and Jungwon. Repeated district names are supported; database IDs and district codes identify locations, never display-only names.

## Shaded listing maps

No-pin listings use versioned, simplified geoBoundaries polygons, not a fabricated radius or bounding box. Source revision `wmgeolab/geoBoundaries@9469f09`, downloaded November 6, 2026; boundary year 2020. Uzbekistan ADM1/ADM2: OCHA ROCCA, CC BY 3.0 IGO ([metadata](https://www.geoboundaries.org/api/current/gbOpen/UZB/ADM2/)). Korea ADM1/ADM2: geoBoundaries/citypopulation.de, CC BY 3.0 ([metadata](https://www.geoboundaries.org/api/current/gbOpen/KOR/ADM2/)). Attribution is displayed on the map. These simplified historical areas are not legal/current boundary guarantees.

`public/maps/areas/{regionCode}.json` contains the region and known district polygons keyed by existing ZUNO district codes. Only the selected region file is fetched, after mounting the map. `scripts/build-area-boundaries.py` reproduces them from the four source files `/tmp/{UZB,KOR}{,1}.geojson`. Download the `_simplified.geojson` files for each country's ADM2 (without `1`) and ADM1 (with `1`) from the pinned revision's `releaseData/gbOpen`; use `media.githubusercontent.com/media` for Git LFS contents. Matching uses exact normalized English names scoped to parent geography, or a globally unique exact district identity. No fuzzy/nearest-district matches. Polygon holes and islands are preserved.

Unmatched/new districts and legacy neighborhood-only rows fall back to the **wider region**, with an explicit on-screen notice. Do not imply that the whole region is the specific district. Missing/unknown regions show an unavailable notice and retain an external map link. Explicit meeting pins keep their existing precise map. No coordinates are invented or written to listings; their stored neighborhood remains the source of location identity. Update the snapshot/mappings in a reviewed change as boundaries change.

Snapshot coverage: 199/199 Uzbekistan catalog districts/cities and 207/249 Korea choices have matched district polygons. The other 42 Korea choices use the explicitly labelled wider region. Source licenses: [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/) and [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

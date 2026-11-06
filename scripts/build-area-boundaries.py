"""Build pinned geoBoundaries snapshots downloaded to /tmp/{UZB,KOR}{,1}.geojson.
See docs/location-data.md. No fuzzy matches: unmatched districts use labelled region fallback.
"""
import json, re, unicodedata
from pathlib import Path
root = Path(__file__).resolve().parents[1]
s = (root / 'src/features/locations/districts.ts').read_text()
districts = json.loads(s[s.index('[\n'):s.rindex(']')+1])
def normalized(s):
    s = unicodedata.normalize('NFKD', s).lower().replace('а','a')
    s = re.sub(r'\s*\[.*?\]', '', s)
    s = re.sub(r'-(si|gun|gu)$', '', s)
    return re.sub(r'[^a-z0-9]', '', s)
def rings(g):
    return [p[0] for p in g['coordinates']] if g['type'] == 'MultiPolygon' else [g['coordinates'][0]]
def inside(x,y,ring):
    result=False
    for a,b in zip(ring,ring[1:]+ring[:1]):
        if (a[1]>y)!=(b[1]>y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: result=not result
    return result
def contains(g,x,y):
    polygons=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    return any(inside(x,y,p[0]) and not any(inside(x,y,hole) for hole in p[1:]) for p in polygons)
for country, prefix in [('UZB','UZ'),('KOR','KR')]:
    regions=json.load(open('/tmp/'+country+'1.geojson'))['features']
    areas=json.load(open('/tmp/'+country+'.geojson'))['features']
    grouped={r['properties']['shapeISO']:[] for r in regions}
    for f in areas:
        # Assign within the pinned source's own parent geography, never by name alone.
        outer=max(rings(f['geometry']),key=len)
        # Find an interior point using scanline intervals (including hole checks).
        ymin,ymax=min(p[1] for p in outer),max(p[1] for p in outer)
        probes=[]
        for fraction in [0.5,0.4,0.6]:
            y=ymin+(ymax-ymin)*fraction; xs=[]
            for a,b in zip(outer,outer[1:]+outer[:1]):
                if (a[1]>y)!=(b[1]>y): xs.append(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))
            xs.sort()
            for a,b in zip(xs[::2],xs[1::2]):
                x=(a+b)/2
                if contains(f['geometry'],x,y): probes.append((b-a,x,y))
        if probes:
            _,x,y=max(probes)
            parents=[r for r in regions if contains(r['geometry'],x,y)]
            if len(parents)==1: grouped[parents[0]['properties']['shapeISO']].append(f)
    matched=0;missing=[]
    for region in regions:
        code=region['properties']['shapeISO']; features={}
        for d in [d for d in districts if d['regionCode']==code]:
            names={normalized(d['english'])}
            candidates=[f for f in grouped[code] if normalized(f['properties']['shapeName']) in names]
            if not candidates:
                # A globally unique exact identity also handles source parent-boundary changes.
                candidates=[f for f in areas if normalized(f['properties']['shapeName']) in names]
                catalog_matches=[x for x in districts if x['regionCode'].startswith(prefix+'-') and (normalized(x['english']) in names)]
                if len(catalog_matches)!=1: candidates=[]
            if len(candidates)==1:
                features[d['code']]=candidates[0]['geometry'];matched+=1
            else: missing.append(d['code'])
        data={'region':region['geometry'],'districts':features}
        # 5 decimals is about a metre; source polygons are already simplified.
        def rounded(v):
            if isinstance(v,float):return round(v,5)
            if isinstance(v,list):return [rounded(x) for x in v]
            if isinstance(v,dict):return {k:rounded(x) for k,x in v.items()}
            return v
        (root/'public/maps/areas'/f'{code}.json').write_text(json.dumps(rounded(data),separators=(',',':'))+'\n')
    print(country,'district matches',matched,'unmatched',len(missing),missing)

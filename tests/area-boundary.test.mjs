import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import './helpers/register-runtime.mjs';
const {selectAreaBoundary}=await import('../src/features/locations/area-boundary.ts');
const load=async code=>JSON.parse(await readFile(new URL(`../public/maps/areas/${code}.json`,import.meta.url)));
test('district maps use stored district identity and preserve filled polygon geometry',async()=>{
 const data=await load('KR-11');
 const selection=selectAreaBoundary(data,{regionCode:'KR-11',districtCode:'KR04D18',neighborhood:'강남구'});
 assert.equal(selection.district,true);
 assert.ok(['Polygon','MultiPolygon'].includes(selection.geometry.type));
 assert.equal(selection.geometry,data.districts.KR04D18);
});
test('legacy names match only within their region and missing districts explicitly use wider region',async()=>{
 const data=await load('UZ-NG');
 assert.equal(selectAreaBoundary(data,{regionCode:'UZ-NG',neighborhood:'Chortoq'}).district,true);
 for(const location of [
  {regionCode:'UZ-NG',neighborhood:'Unknown'},
  {regionCode:'UZ-NG',districtCode:'KR04D18',neighborhood:'강남구'},
 ]) {
  const selection=selectAreaBoundary(data,location);
  assert.equal(selection.district,false);assert.equal(selection.geometry,data.region);
 }
});

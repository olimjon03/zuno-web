import test from 'node:test';
import assert from 'node:assert/strict';
import {regions,selectCountry,selectRegion,matchesLocation,resolveLocation,formatLocationLabel} from '../src/features/locations/catalog.ts';
test('country catalogs contain all provinces and separate city/republic entries',()=>{
 assert.equal(regions.UZ.filter(region=>region.kind==='province').length,12);
 assert.equal(regions.UZ.length,14);
 assert.equal(regions.KR.length,17);
 assert.equal(regions.KR.filter(region=>region.kind==='city').length,8);
 assert.equal(new Set([...regions.UZ,...regions.KR].map(region=>region.code)).size,31);
});
test('switching country clears the old region and rejects another country’s region',()=>{
 const uz=selectRegion(selectCountry('UZ'),'UZ-TO');
 assert.equal(uz.region,'UZ-TO');
 const kr=selectCountry('KR');assert.equal(kr.region,'');
 assert.equal(selectRegion(kr,uz.region).region,'');
 assert.equal(selectRegion(kr,'KR-11').region,'KR-11');
 assert.deepEqual(selectCountry('unknown'),{country:'',region:''});
});
test('region filtering separates countries, handles legacy Seoul and never guesses unknown places',()=>{
 const seoul={neighborhood:'Seongsu-dong'};
 const andijon={neighborhood:'Local area',countryCode:'UZ',regionCode:'UZ-AN'};
 assert.equal(matchesLocation(seoul,{country:'KR',region:'KR-11'}),true);
 assert.equal(matchesLocation(seoul,{country:'KR',region:'KR-26'}),false);
 assert.equal(matchesLocation(seoul,{country:'UZ',region:''}),false);
 assert.equal(matchesLocation(andijon,{country:'UZ',region:'UZ-AN'}),true);
 assert.equal(matchesLocation(andijon,{country:'UZ',region:'UZ-TO'}),false);
 assert.equal(matchesLocation(andijon,{country:'KR',region:''}),false);
 assert.equal(matchesLocation(seoul,{country:'UZ',region:'KR-11'}),false);
 assert.equal(matchesLocation({neighborhood:'Unknown'},{country:'KR',region:''}),false);
 assert.equal(matchesLocation({neighborhood:'Unknown'},{country:'',region:''}),true);
 assert.deepEqual(resolveLocation('Seongsu-dong','UZ-TK'),{countryCode:'UZ',regionCode:'UZ-TK'});
 assert.deepEqual(resolveLocation('Unknown','bad-code'),{});
 assert.equal(matchesLocation({...andijon,countryCode:'KR'},{country:'KR',region:''}),false);
});

test('location labels use actual metadata rather than hard-coding Seoul',()=>{
 assert.equal(formatLocationLabel({neighborhood:'Seongsu-dong'}),'Seoul · Seongsu-dong');
 assert.equal(formatLocationLabel({neighborhood:'Local area',countryCode:'UZ',regionCode:'UZ-AN'}),'Andijon viloyati · Local area');
 assert.equal(formatLocationLabel({neighborhood:'Unknown'}),'Unknown');
});

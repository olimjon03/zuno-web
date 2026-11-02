import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterMarketplace} from '../src/features/locations/catalog.ts';
const items=[{title:'UZ chair',category:'Home',neighborhood:'Toshkent',countryCode:'UZ',regionCode:'UZ-TK',price:100000,status:'active'},{title:'KR chair',category:'Home',neighborhood:'Seoul',countryCode:'KR',regionCode:'KR-11',price:20000,status:'sold'},{title:'Reserved',category:'Other',neighborhood:'Toshkent',countryCode:'UZ',regionCode:'UZ-TK',price:90000,status:'reserved'}];
const base={category:'All items',location:{country:'UZ',region:''},query:'',minPrice:'',maxPrice:'',availableOnly:false};
test('market filters combine country, region, category, query, price and availability',()=>{
 assert.equal(filterMarketplace(items,base).length,2);
 assert.equal(filterMarketplace(items,{...base,minPrice:'95000',maxPrice:'110000'})[0].title,'UZ chair');
 assert.equal(filterMarketplace(items,{...base,availableOnly:true}).length,1);
 assert.equal(filterMarketplace(items,{...base,query:'chair',category:'Other'}).length,0);
 assert.equal(filterMarketplace(items,{...base,minPrice:'200000',maxPrice:'1'}).length,0);
 assert.equal(filterMarketplace(items,{...base,location:{country:'KR',region:'KR-11'}})[0].title,'KR chair');
 assert.equal(filterMarketplace(items,{...base,location:{country:'',region:''},minPrice:'999999'}).length,3);
});

import {currencyForCountry,formatMoney} from '../src/features/listings/currency.ts';
test('country currency is UZS for Uzbekistan and KRW for Korea without converting amounts',()=>{assert.equal(currencyForCountry('UZ'),'UZS');assert.equal(currencyForCountry('KR'),'KRW');assert.match(formatMoney(100000,'UZ'),/100.*000 so‘m/);assert.match(formatMoney(100000,'KR'),/100,000/);});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import './helpers/register-runtime.mjs';
import {priceDigits,formatPriceInput} from '../src/features/listings/price-input.ts';
import {formatMoney} from '../src/features/listings/currency.ts';
test('price inputs group thousands and submit digits only, retaining empty and free prices',()=>{
 for(const [digits,formatted] of [['',''],['0','0'],['10000','10,000'],['100000','100,000'],['1000000000000','1,000,000,000,000']]){
  assert.equal(formatPriceInput(digits),formatted);assert.equal(priceDigits(formatted),digits);
 }
 assert.equal(priceDigits('00010'),'10');
 for(const invalid of ['-100','1.50','1e3','abc']) assert.equal(priceDigits(invalid),null);
 assert.equal(formatMoney(100000,'UZ'),'100,000 so‘m');
 assert.equal(formatMoney(100000,'KR'),'₩100,000');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {splitPhone,joinPhone} from '../src/lib/phone-country.js';
test('Mexico is default and optional blank stays blank',()=>{
 assert.deepEqual(splitPhone(''),{codigo:'52',numero:''});
 assert.equal(joinPhone({codigo:'52',numero:''}),'');
 assert.equal(joinPhone({codigo:'52',numero:'55 1234 5678'}),'525512345678');
});
test('contacts and stored international numbers do not duplicate country code',()=>{
 for(const number of ['+52 (55) 1234-5678','525512345678','00525512345678'])assert.deepEqual(splitPhone(number),{codigo:'52',numero:'5512345678'});
 assert.deepEqual(splitPhone('5512345678'),{codigo:'52',numero:'5512345678'});
 assert.deepEqual(splitPhone('+1 212 555 1234'),{codigo:'1',numero:'2125551234'});
 assert.deepEqual(splitPhone('+506 8888 1234'),{codigo:'506',numero:'88881234'});
 assert.equal(joinPhone(splitPhone('+91 9876543210')),'919876543210');
});

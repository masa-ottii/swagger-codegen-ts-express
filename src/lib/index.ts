import {BigNumber} from 'bignumber.js';

export function decode_bigint(s:string): BigNumber {
  return new BigNumber(s);
}

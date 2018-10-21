import {BigNumber} from 'bignumber.js';

export function decode_string_number(s:string, schema:any): number {
  return 0;
}
export function decode_string_string(s:string, schema:any): string {
  return s;
}
export function decode_string_Date(s:string, schema:any): Date {
  return new Date();
}
export function decode_string_BigNumber(s:string, schema:any): BigNumber {
  return new BigNumber(s);
}
export function decode_json_object(o:object, schema:any): object {
  return o;
}

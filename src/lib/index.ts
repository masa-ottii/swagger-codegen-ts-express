import {BigNumber} from 'bignumber.js';

/**
 *  The function name with _external prefix means the decoder output type is specialized in swagger.
 *  To use internal type such as BigNumber or Date, we need to implements all data include member of
 * dtsgenerator generated types. The swagger2 and is-my-json-valid do it but I've not yet. So I use
 * that libraries and I need to output types they treat.
 */
export function decode_json_undefined_undefined_external(i:undefined, schema:any): undefined {
  return undefined;
}
export function decode_json_string_date_external(i:string, schema:any): string {
  return i;
}
export function decode_json_string_string_external(i:string, schema:any): string {
  return i;
}
export function decode_json_integer_number_external(i:number, schema:any): number {
  return i;
}
export function decode_json_integer_bignumber_external(i:number, schema:any): number {
  //精度落ちが生じるが、守りたいなら swagger で string と書け、と。
  return i;
}
export function decode_json_number_number_external(i:number, schema:any): number {
  return i;
}
export function decode_json_boolean_boolean_external(i:boolean, schema:any): boolean {
  return i;
}
export function decode_json_object_object_external(i:object, schema:any): any {
  return i;
}


export function decode_string_undefined_undefined_external(s:string, schema:any): undefined {
  return decode_json_undefined_undefined_external(undefined, schema);
}
export function decode_string_string_date_external(s:string, schema:any): string {
  return decode_json_string_date_external(s, schema);
}
export function decode_string_string_string_external(s:string, schema:any): string {
  return decode_json_string_string_external(s, schema);
}
export function decode_string_integer_number_external(s:string, schema:any): number {
  const i = parseInt(s, 10);
  return decode_json_integer_number_external(i, schema);
}
export function decode_string_integer_bignumber_external(s:string, schema:any): number {
  const i = parseInt(s, 10);
  return decode_json_integer_bignumber_external(i, schema);
}
export function decode_string_number_number_external(s:string, schema:any): number {
  const i = Number(s);
  return decode_json_number_number_external(i, schema);
}
export function decode_string_boolean_boolean_external(s:string, schema:any): boolean {
  const i = (s === 'true');
  return decode_json_boolean_boolean_external(i, schema);
}
export function decode_string_object_object_external(s:string, schema:any): any {
  const i = JSON.parse(s);
  return decode_json_object_object_external(i, schema);
}

export function decode_json_array_undefined_undefined_external(i:undefined[], schema:any): undefined[] {
  // TODO: schema も array を展開すべき
  return i.map((ii) => { return decode_json_undefined_undefined_external(ii, schema); });
}
export function decode_json_array_string_date_external(i:string[], schema:any): string[] {
  return i.map((ii) => { return decode_json_string_date_external(ii, schema); });
}
export function decode_json_array_string_string_external(i:string[], schema:any): string[] {
  return i.map((ii) => { return decode_json_string_string_external(ii, schema); });
}
export function decode_json_array_integer_number_external(i:number[], schema:any): number[] {
  return i.map((ii) => { return decode_json_integer_number_external(ii, schema); });
}
export function decode_json_array_integer_bignumber_external(i:number[], schema:any): number[] {
  return i.map((ii) => { return decode_json_integer_bignumber_external(ii, schema); });
}
export function decode_json_array_number_number_external(i:number[], schema:any): number[] {
  return i.map((ii) => { return decode_json_number_number_external(ii, schema); });
}
export function decode_json_array_boolean_boolean_external(i:boolean[], schema:any): boolean[] {
  return i.map((ii) => { return decode_json_boolean_boolean_external(ii, schema); });
}
export function decode_json_array_object_object_external(i:object[], schema:any): object[] {
  return i.map((ii) => { return decode_json_object_object_external(ii, schema); });
}

export function decode_string_array_undefined_undefined_external(s:string[], schema:any): undefined[] {
  return s.map((ss) => { return decode_string_undefined_undefined_external(ss, schema); });
}
export function decode_string_array_string_date_external(s:string[], schema:any): string[] {
  return s.map((ss) => { return decode_string_string_date_external(ss, schema); });
}
export function decode_string_array_string_string_external(s:string[], schema:any): string[] {
  return s.map((ss) => { return decode_string_string_string_external(ss, schema); });
}
export function decode_string_array_integer_number_external(s:string[], schema:any): number[] {
  return s.map((ss) => { return decode_string_integer_number_external(ss, schema); });
}
export function decode_string_array_integer_bignumber_external(s:string[], schema:any): number[] {
  return s.map((ss) => { return decode_string_integer_bignumber_external(ss, schema); });
}
export function decode_string_array_number_number_external(s:string[], schema:any): number[] {
  return s.map((ss) => { return decode_string_number_number_external(ss, schema); });
}
export function decode_string_array_boolean_boolean_external(s:string[], schema:any): boolean[] {
  return s.map((ss) => { return decode_string_boolean_boolean_external(ss, schema); });
}
export function decode_string_array_object_object_external(s:string[], schema:any): any[] {
  return s.map((ss) => { return decode_string_object_object_external(ss, schema); });
}

import * as Koa from 'koa';
import {types_body_object as op} from 'swagger-generated/example';

export const handler:op.Handler = async (req) => {
  console.log('types_body_object: ' + JSON.stringify(req));
  let resDef: op.ResponseDefault|undefined = undefined;
  return { status: 404, body: resDef };
};

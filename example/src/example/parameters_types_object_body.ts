import * as Koa from 'koa';
import {parameters_types_object_body as op} from 'swagger-generated/example';

export const handler:op.Handler = async (req) => {
  console.log('parameters_types_object_body: ' + JSON.stringify(req));
  let resDef: op.ResponseDefault|undefined = undefined;
  return { status: 404, body: resDef };
};

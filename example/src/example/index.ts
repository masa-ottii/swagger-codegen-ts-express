import * as Koa from 'koa';
import * as api from 'swagger-generated/example';

import * as types_body_object from './types_body_object';
import * as responses_empty from './responses_empty';

export function setup(app: Koa) {
  const router = api.setup(app, './swagger/dist/example/swagger.yaml', ''); //related to package.json
  router.swagger.types_body_object = types_body_object.handler;
  router.swagger.responses_no_schema = responses_empty.no_schema;
  router.swagger.responses_empty_object = responses_empty.empty_object;
}

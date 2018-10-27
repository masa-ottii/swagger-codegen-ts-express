import * as Koa from 'koa';
import * as api from 'swagger-generated/example';

import * as parameters_types_object_body from './parameters_types_object_body';
import * as responses_empty from './responses_empty';

export function setup(app: Koa) {
  const router = api.setup(app, './swagger/dist/example/swagger.yaml', ''); //related to package.json
  router.swagger.parameters_types_object_body = parameters_types_object_body.handler;
  router.swagger.responses_no_schema = responses_empty.no_schema;
  router.swagger.responses_empty_object = responses_empty.empty_object;
}

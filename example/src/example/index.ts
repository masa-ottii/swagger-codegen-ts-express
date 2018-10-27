import * as Koa from 'koa';
import * as api from 'swagger-generated/example';

import * as parameters_types_object_body from './parameters_types_object_body';

export function setup(app: Koa) {
  const router = api.setup(app, './swagger/dist/example/swagger.yaml', ''); //related to package.json
  router.swagger.parameters_types_object_body = parameters_types_object_body.handler;
}

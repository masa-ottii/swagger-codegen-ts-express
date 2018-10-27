import * as Koa from 'koa';
import * as api from 'swagger-generated/example';

export const no_schema:api.responses_no_schema.Handler = async (req) => {
  console.log('response_types_no_schema');
  let resDef: api.responses_no_schema.Response200|undefined = undefined;
  // validator は {} を求めるようだが、実際 koa レベルで {} にしてもエラーになる。
  return { status: 200, body: resDef };
};

export const empty_object:api.responses_empty_object.Handler = async (req) => {
  console.log('response_types_empty_object');
  let res200: api.responses_empty_object.Response200|undefined = undefined;
  res200 = {};
  return { status: 200, body: res200 };
};

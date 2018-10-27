import * as Koa from 'koa';
import * as api from 'swagger-generated/simple';

const get_user:api.get_user.Handler = async (req) => {
  console.log('get_user');
  let res200: api.get_user.Response200|undefined = undefined;
  let resDef: api.get_user.ResponseDefault|undefined = undefined;

  if (req.user_id == 20070831) {
    res200 = { user_id: req.user_id, name: 'Hatsune Miku' };
    return { status: 200, body: res200 };
  } else if (req.user_id == 20071227) {
    res200 = { user_id: req.user_id, name: 'Kagamine Rin' };
    return { status: 200, body: res200 };
  } else {
    resDef = { code: 404, name: 'Not Found', message: `unknown user: ${req.user_id}` };
    return { status: 404, body: resDef };
  }
};

export function setup(app: Koa) {
  const router = api.setup(app, './swagger/dist/simple/swagger.yaml', ''); //related to package.json
  router.swagger.get_user = get_user;
}

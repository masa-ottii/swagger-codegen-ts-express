import Server from './server';
import * as api_simple from 'swagger-generated/simple';

const get_user:api_simple.get_user.Handler = async (req) => {
  console.log('get_user');
  let res200: api_simple.get_user.Response200|undefined = undefined;
  let resDef: api_simple.get_user.ResponseDefault|undefined = undefined;

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

const server = new Server();
const router = api_simple.setup(server.app, './swagger/dist/simple/swagger.yaml', ''); //related to package.json

router.swagger.get_user = get_user;
server.start();

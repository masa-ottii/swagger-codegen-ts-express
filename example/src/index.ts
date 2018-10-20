import Server from './server';
//import * as api_example from 'swagger-generated/example';
import * as api_example from '../swagger/dist/example';

const method_get = api_example.paths.method_get.Handler = (req) => {
  console.log('method_get: ' + JSON.stringify(req));
  let res: api_example.paths.method_get.ResponseDefault|undefined = undefined;

  res = { };
  return res;
};
/*
  console.log('get /test/:user_id');
  console.log('user_id=' + req.foo);
  console.log('yell_card_id=' + req.yell_card_id);
  console.log('foo=' + req.foo);
  console.log('typeof foo: ' + typeof(req.foo));

  let r:api_user.UserGetTestResponse200 = {
    a: "str",
    b: req.foo * 2,
    c: "str",
  };
  return { status:200, body:r };
}
*/

const server = new Server();
const router = api_example.setup(server.app, './swagger/dist/example/swagger.yaml', ''); //related to package.json

router.swagger.method_get = method_get;

/*
user_router.swagger.user_post_job_create_user = async (req) => {
  console.log('post /jobs/create_user');
  console.log('user_id=' + req.parameters.user_id);
  console.log('wallet_id=' + req.parameters.wallet_id);
  let res400: api_user.UserPostJobCreateUserResponse400|undefined = undefined;
  let res200: api_user.UserPostJobCreateUserResponse200|undefined = undefined;

  const conn = await db.getConnection();
  const user = new db.User(req.parameters.user_id, 0, 0);
  const repo = conn.getRepository(db.User);
  let result = await repo.insert(user).then(async (ok) => {
    const saved = await repo.findOne({etc_id:user.etc_id});
    if (saved) {
      return { ok:saved, res400 };
    } else {
      res400 = { code: 100, name: 'NOT FOUND', message: 'fail to insert' };
      return { ok:null, res400 };
    }
  }).catch(err => {
    if (err.code == 'ER_DUP_ENTRY') {
      res400 = { code: 3939, name: 'DUPLICATED', message: 'fail to insert' };
      return { ok:null, res400 };
    } else {
      throw err;
    }
  });
  if (result.res400) {
    return { status:400, body:result.res400 };
  }

  const ok = result.ok!;
  console.log('ok=' + JSON.stringify(ok));
  res200 = {
    user_id: ok.etc_id,
    job_id: 'jobid',
    job_type: 'create_user',
    state: 'begin',
    creation_info: {
      timestamp:  ok.create_datetime!.toISOString(), // (Date.now() / 1000).toFixed(0),
      parameters: req.parameters
    }
  };
  return { status:200, body:res200 };
}
*/

server.start();

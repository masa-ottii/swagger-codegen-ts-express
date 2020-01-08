# swagger-codegen-ts-express
Generate TypeScript Express server skeleton codes from swagger spec.

## usage

```console
$ node swagger-codegen-ts-express <input.swagger.yaml> <output.ts>
```

and output.ts requires dtsgenerator@1.2.0 outputs.

```console
$ npx dtsgenerator@1.2.0 -n "" -o swagger.d.ts <input.swagger.yaml>
```


## example

### input swagger file

```YAML
paths:
  '/users/{user_id}':
    get:
      summary: get user
      operationId: get_user
      description: |
        get user
      parameters:
        - in: path
          required: true
          name: user_id
          type: integer
          description: user_id
      responses:
        '200':
          description: OK
          schema:
            $ref: '#/definitions/User'
        default:
          description: ERR
          schema:
            $ref: '#/definitions/ErrorResponse'
definitions:
  User:
    type: object
    properties:
      user_id:
        type: integer
      name:
        type: string
  ErrorResponse:
    type: object
    required:
      - code
      - name
      - message
    properties:
      code:
        type: integer
      name:
        type: string
      message:
        type: string
```

### output .ts file

```TypeScript
// ---- GET /users/{user_id} -------------------
export namespace get_user {
  export type Request = {
    user_id: number
  }
  export function make_request(ctx: KoaRouter.IRouterContext): Request {
    return {
      user_id: sctk.decode_string_integer_bignumber_external(
        ctx.params.user_id,
        {
          in: 'path',
          required: true,
          name: 'user_id',
          type: 'integer',
          description: 'user_id'
        }
      )
    }
  }
  export type Response200 = d.User
  export type ResponseDefault = d.ErrorResponse
  export type Response = {
    status: number
    body: Response200 | ResponseDefault
  }
  export interface Handler {
    (req: Request): Promise<Response>
  }
  export function route(router: Router) {
    router.get('/simple-v1/users/{user_id}', async ctx_ => {
      ...
    });
  }
}

export interface Routes {
  get_user?: get_user.Handler
  post_users?: post_users.Handler
}
export class Router extends KoaRouter {
  swagger: Routes = {}
}

export function setup(
  app: Koa,
  swagger_filepath: string,
  routes_dirpath: string
): Router {
  ...
}
```


### server code

You would implements the API such as:

```TypeScript
import Server from './server';
import * as api_simple from 'swagger-generated/simple'; //tsconfig.paths

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
```


And setup and run app:

```TypeScript
const server = new Server();
const router = api_simple.setup(server.app, './swagger/dist/simple/swagger.yaml', '');

router.swagger.get_user = get_user;
server.start();
```

### call API

returns implemented result:
```console
$ curl 'http://localhost:10080/simple-v1/users/20071227'
{"user_id":20071227,"name":"Kagamine Rin"}

$ curl 'http://localhost:10080/simple-v1/users/1'
{"code":404,"name":"Not Found","message":"unknown user: 1"}
```

type validation failed:

```console
$ curl 'http://localhost:10080/simple-v1/users/string'
{"code":"SWAGGER_REQUEST_VALIDATION_FAILED","errors":[{"actual":"string","expected":{"type":"integer"},"where":"path"}]}
```

### more...
If you see package.json or other settings, please check https://github.com/dai1975/swagger-codegen-ts-express/tree/master/examle directory.

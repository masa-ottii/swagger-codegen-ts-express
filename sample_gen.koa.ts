import { BigNumber } from 'bignumber.js';
import * as swagger2 from 'swagger2';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import {validate} from 'swagger2-koa';
import * as sctk from 'swagger-codegen-ts-express';
export *  from './swagger';
import * as d from './swagger';
//-- end of header -----------------------------------------
// ---- GET /users/{user_id} -------------------
export namespace get_user {
  export type Request = {
    user_id: number;
  }
  export function make_request(ctx: KoaRouter.IRouterContext): Request {
    return {
        user_id: sctk.decode_string_integer_bignumber_external(ctx.params.user_id!, {"in":"path","required":true,"name":"user_id","type":"integer","description":"user_id"}),
    };
  }
  export type Response200 = d.User;
  export type ResponseDefault = d.ErrorResponse;
  export type Response = {
    status: number;
    body: Response200 | ResponseDefault;
  };
  export interface Handler {
    (req:Request, ctx:KoaRouter.IRouterContext): Promise<Response>;
  };
  export function route(router:Router) {
    router.get('/simple-v1/users/:user_id', async (ctx_) => {
      const ctx = <any>ctx_;  //KoaRouter.Router.IRouterContext;
      const router = ctx.router as Router;
      if (router.swagger.get_user) {
        const req = make_request(ctx);
        const res = await router.swagger.get_user!(req, ctx);
        ctx.status = res.status;
        ctx.body   = res.body;
      } else {
        ctx.status = 500;
        ctx.body = {
          details: 'not implemented yet'
        };
      }
    });
  }
}
// ---- POST /users -------------------
export namespace post_users {
  export type Request = {
    user?: {
user_id?: number
name?: string
};
  }
  export function make_request(ctx: KoaRouter.IRouterContext): Request {
    return {
        user: (ctx.request.body)?sctk.decode_json_object_object_external(ctx.request.body!, {"type":"object","properties":{"user_id":{"type":"integer"},"name":{"type":"string"}}}):undefined,
    };
  }
  export type Response200 = d.User;
  export type Response400 = d.ErrorResponse;
  export type Response = {
    status: number;
    body: Response200 | Response400;
  };
  export interface Handler {
    (req:Request, ctx:KoaRouter.IRouterContext): Promise<Response>;
  };
  export function route(router:Router) {
    router.post('/simple-v1/users', async (ctx_) => {
      const ctx = <any>ctx_;  //KoaRouter.Router.IRouterContext;
      const router = ctx.router as Router;
      if (router.swagger.post_users) {
        const req = make_request(ctx);
        const res = await router.swagger.post_users!(req, ctx);
        ctx.status = res.status;
        ctx.body   = res.body;
      } else {
        ctx.status = 500;
        ctx.body = {
          details: 'not implemented yet'
        };
      }
    });
  }
}

//-- footer -----------------------------------------
export interface Routes {
  get_user?: get_user.Handler;
  post_users?: post_users.Handler;
}
export class Router extends KoaRouter {
  swagger: Routes = {};
}

export function setup(app:Koa, swagger_filepath:string, routes_dirpath:string): Router {
  const document = swagger2.loadDocumentSync(swagger_filepath); //related from dir of which package.json is located
  if (!swagger2.validateDocument(document)) {
    throw Error('swagger validation failed');
  }
  app.use(validate(document));
  //const router0 = new KoaRouter();
  //const router: Router = { swagger: {}, ...router0 };
  const router = new Router();
  app.use(router.routes());
  app.use(router.allowedMethods());

  get_user.route(router);
  post_users.route(router);

  return router;
}

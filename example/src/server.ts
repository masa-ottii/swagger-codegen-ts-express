import * as Koa from 'koa';
import * as bodyparser from 'koa-bodyparser';
//import * as koaConvert from 'koa-convert';
import * as koaCors from 'koa-cors';
import * as koaRouter from 'koa-router';
import * as swagger from 'swagger2';
import * as debug from 'debug';

function debug_middleware(name:string) {
  const log = debug(name);
  if (!log.enabled) {
    return (ctx:any, next: () => void) => next();
  }
  return async (ctx:Koa.Context, next: ()=>void) => {
    const startTime = Date.now();
    const { method, url } = ctx.request;
    await next();
    const status = ctx.status;
    const req = ctx.request.body === undefined? '': JSON.stringify(ctx.request.body);
    const res = ctx.response.body === undefined? '': JSON.stringify(ctx.response.body);
    const time = Date.now() - startTime;

    log(`${method} ${url} ${req} -> ${status} ${res} ${time}ms`);
  };
}

function create_app(): Koa {
  const app = new Koa();
  
  //const appUse = app.use;
  //app.use = (x) => appUse.call(app, koaConvert(x));

  app.use(debug_middleware('swagger2-koa:router'));
  app.use(koaCors());
  app.use(bodyparser());
  return app;
}

export default class Server {
  port: number = 10080;
  app:  Koa;

  constructor() {
    this.app = create_app();
  }
  async start() {
    //app.use(ui(document))
    this.app.listen(this.port, () => {
      console.log(`listen on ${this.port}`);
    });
  }
}


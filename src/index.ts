import * as create_debug from 'debug';
import * as fs from 'fs';
import * as mustache from 'mustache';
import * as sw2 from 'swagger2';
import * as sw2_schema from '../node_modules/swagger2/dist/schema';
import * as sw2_compiler from '../node_modules/swagger2/dist/compiler';

interface CompiledOperation extends sw2_schema.Operation {
  resolvedParameters: sw2_schema.Parameter[];
}

const debug = create_debug('debug');

class Generator {
  static METHODS: string[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

  static generate(doc: sw2_schema.Document, out: fs.WriteStream) {
    const g = new Generator(doc, out);
    g.on_root();
  }
  doc: sw2_schema.Document;
  compiled: sw2.Compiled;
  out: fs.WriteStream;
  constructor(doc: sw2_schema.Document, out: fs.WriteStream) {
    this.doc = doc;
    this.compiled = sw2.compileDocument(doc);
    this.out = out;
  }

  private render(filename:string, data:Object) {
    const tmpl = fs.readFileSync(`${__dirname}/mustache/${filename}.mustache`, 'utf-8');
    const result = mustache.render(tmpl, data);
    this.out.write(result);
  }

  on_root() {
    debug('on_root');
    this.render('header', {});

    //out.write('path=' + path + "\n");
    Object.keys(this.doc.paths).forEach(path => {
      debug('path=' + path);
      const path_item = this.doc.paths[path];
      const fullpath = this.doc.basePath ? this.doc.basePath + path : path;
      const cpath = this.compiled(fullpath);
      if (cpath == null) {
        throw new Error('cannot found compiled path: ' + fullpath);
      }
      this.on_path(path, path_item, cpath!);
    })
    this.render('footer', {});
  }
  on_path(path: string, item: sw2_schema.PathItem, cpath: sw2_compiler.CompiledPath) {
    debug('on_path: ' + path);
    Generator.METHODS.forEach(method => {
      const op = item[method];
      if (op != null) {
        const cop = (cpath.path as any)[method];
        if (cop == null) {
          throw new Error(`cannot found compiled operator: path=${path}, method=${method}`);
        }
        this.on_operation(path, method, op, cop! as CompiledOperation);
      }
    })
  }
  on_operation(path: string, method: string, op: sw2_schema.Operation, cop: CompiledOperation) {
    //debug('resolved=' + JSON.stringify(cop.resolvedParameters));
    const parameters = cop.resolvedParameters.map((p:sw2_schema.Parameter) => {
      let ret:any = {};
      let def:any = Object.assign({}, p);
      if (p.name === undefined) {
        throw new Error(`the 'name' field of Parameter is not defined: path=${path}, method=${method}`);
      }
      if (p.in === undefined) {
        throw new Error(`the 'in' field of Parameter is not defined: ${p.name}`);
      }
      if (p.type === undefined) {
        throw new Error(`the 'type' field of Parameter is not defined: ${p.name}`);
      } else if (p.type === 'array') {
        throw new Error(`array is not supported yet`);
      } else if ((<any>p.type) === 'file') {
        throw new Error(`file is not supported yet`);
      } else if (p.type === 'string') {
        let _ = <any>p;
        if (p.format === 'byte') {
          ret.type = 'Buffer';
          ret.decoder = 'byte';
        } else if (p.format === 'binary') {
          ret.type = 'Buffer';
          ret.decoder = 'binary';
        } else if (p.format === 'date') {
          ret.type = 'Date';
          ret.decoder = 'date';
        } else if (p.format === 'date-time') {
          ret.type = 'Date';
          ret.decoder = 'datetime';
        } else {
          ret.type = 'string';
        }
      } else if (p.type === 'number') {
        ret.type = 'number';
      } else if (p.type === 'integer') {
        let _ = <any>p;
        if ((p.format === undefined || p.format === 'int64') &&
            (_.maximum === undefined || Number.MAX_SAFE_INTEGER < _.maximum ||
             _.minimum === undefined || _.minimum < Number.MIN_SAFE_INTEGER))
        {
          ret.type = 'BigNumber';
        } else {
          ret.type = 'number';
        }
      } else if (p.type === 'boolean') {
        ret.type = 'boolean';
      }
      if (ret.decoder === undefined) {
        ret.decoder = ret.type.toLowerCase();
      }
      return {
        name: p.name,
        required: p.required,
        def: JSON.stringify(def),
        ...ret,
      };
    });
    this.render('operation', {
      method: method.toUpperCase(),
      path: path,
      operationId: cop.operationId,
      parameters
    });
  }
}

export function main(inpath: string, outpath: string) {
  const out = fs.createWriteStream(outpath, { flags: 'wx' });

  const doc = sw2.loadDocumentSync(inpath);
  if (!sw2.validateDocument(doc)) {
    throw Error(`validation failed: ${inpath}`);
  }
  Generator.generate(doc, out);
}

import * as create_debug from 'debug';
import * as fs from 'fs';
import upperFirst = require('lodash.upperfirst');
import * as mustache from 'mustache';
import * as sw2 from 'swagger2';
import * as sw2_schema from 'swagger2/dist/schema';
import * as sw2_compiler from 'swagger2/dist/compiler';

const debug = create_debug('debug');

interface CompiledOperation extends sw2_schema.Operation {
  resolvedParameters: sw2_schema.Parameter[];
}

class TypeGenerator {
  codes: string[];
  constructor() {
    this.codes = [];
  }
  static walk(def: any): string {
    const g = new TypeGenerator();
    g.on_definition(def);
    return g.codes.join('\n');
  }
  on_definition(def: any) {
    if (def === undefined || def.type === undefined) {
      this.codes.push('any');
    } else if (def.type == 'string') {
      if (def.format === 'date' || def.format === 'date-time') {
        this.codes.push('Date');
      } else {
        this.codes.push('string');
      }
    } else if (def.type == 'integer') {
      if ((def.format === undefined || def.format === 'int64') &&
          (def.maximum === undefined || Number.MAX_SAFE_INTEGER < def.maximum ||
           def.minimum === undefined || def.minimum < Number.MIN_SAFE_INTEGER))
      {
        this.codes.push('BigNumber');
      } else {
        this.codes.push('number');
      }
    } else if (def.type == 'number') {
      this.codes.push('number');
    } else if (def.type == 'boolean') {
      this.codes.push('number');
    } else if (def.type === 'array') {
      const subtype = TypeGenerator.walk(def.items);
      this.codes.push(`${subtype}[]`);
    } else if (def.type === 'object') {
      if (def.properties === undefined) {
        this.codes.push('any');
      } else {
        const props = def.properties;
        const subcodes = Object.keys(props).map((k) => {
          const p = props[k];
          const required =
            ((props.required && props.required[k]) || (p.required))? '': '?';
          const t = TypeGenerator.walk(def.properties[k]);
          return(`${k}${required}: ${t}`);
        });
        this.codes.push("{\n" + subcodes.join('\n') + "\n}");
      }
    }
  }
}


class Generator {
  static METHODS: string[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

  static generate(doc: sw2_schema.Document, out: fs.WriteStream) {
    const g = new Generator(doc, out);
    g.on_root();
  }
  doc: sw2_schema.Document;
  compiled: sw2.Compiled;
  out: fs.WriteStream;
  results:any;

  constructor(doc: sw2_schema.Document, out: fs.WriteStream) {
    this.doc = doc;
    this.compiled = sw2.compileDocument(doc);
    this.out = out;
    this.results = {};
  }

  private render(filename:string, data:Object) {
    const tmpl = fs.readFileSync(`${__dirname}/mustache/${filename}.mustache`, 'utf-8');
    const result = mustache.render(tmpl, data);
    this.out.write(result);
  }

  on_root() {
    debug('on_root');
    this.results = {};
    this.render('header', {});

    this.render('paths-header', {});
    this.results.operations = [];
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
    this.render('paths-footer', {});
    this.render('footer', {operations: this.results.operations});
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
    });
  }

  parse_operation_parameter(p:sw2_schema.Parameter, position:string): object {
    let ret:any = {
      name: p.name,
      required: p.required,
    };

    if (p.name === undefined) {
      throw new Error(`the 'name' field of Parameter is not defined: ${position}`);
    }

    if (p.in === undefined) {
      throw new Error(`the 'in' field of Parameter is not defined: ${p.name}: ${position}`);
    } else if (p.in === 'query') {
      Object.assign(ret, { container: 'query',  encode: 'string' });
    } else if (p.in === 'header' || p.in === 'path') {
      Object.assign(ret, { container: 'params', encode: 'string' });
    } else {
      Object.assign(ret, { container: 'params', encode: 'json' });
    }

    const schema = p.schema || p;
    ret.type_code = TypeGenerator.walk(schema);
    ret.schema_code = JSON.stringify(schema);
    return ret;
  }
  parse_operation_response(status:string, res:sw2_schema.Response, position:string) {
    const pascalcase = upperFirst(status);
    return {
      status: {
        raw: status,
        pascalcase,
      }
    };
  }
  on_operation(path: string, method: string, op: sw2_schema.Operation, cop: CompiledOperation) {
    //debug('resolved=' + JSON.stringify(cop.resolvedParameters));

    const position=`path=${path}, method=${method}`;
    const parameters = cop.resolvedParameters.map((p:sw2_schema.Parameter) => {
      return this.parse_operation_parameter(p, position);
    });
    const responses = Object.keys(op.responses).map((status:string) => {
      const res = op.responses[status];
      return this.parse_operation_response(status, res, position);
    });
    const response_types = responses.map((d:any) => {
      return `Response${d.status.pascalcase}`;
    });
    this.render('operation', {
      method: {
        lower: method.toLowerCase(),
        upper: method.toUpperCase(),
      },
      path: path,
      operationId: cop.operationId!,
      parameters,
      responses,
      response_types: response_types.join(' | '),
    });
    this.results.operations.push({
      operationId: cop.operationId
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

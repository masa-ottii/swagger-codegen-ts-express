import * as create_debug from 'debug';
import * as fs from 'fs';
import upperFirst = require('lodash.upperfirst');
import * as mustache from 'mustache';
import * as sw2 from 'swagger2';
import * as sw2_schema from 'swagger2/dist/schema';
import * as sw2_compiler from 'swagger2/dist/compiler';

const debug = create_debug('codegen');

interface CompiledOperation extends sw2_schema.Operation {
  resolvedParameters: sw2_schema.Parameter[];
}

class TypeGenerator {
  _mode: {
    internal: boolean,
    swagger_dts_ns: string,
  };
  _codes: string[];
  _schema_type:   string | undefined;
  _internal_type: string | undefined;
  _external_type: string | undefined;
  _decoder: string | undefined;
  constructor(mode:any) {
    this._mode = mode;
    this._codes = [];
    this._schema_type   = undefined;
    this._internal_type = undefined;
    this._external_type = undefined;
    this._decoder = undefined;
  }
  get schema_type(): string {
    return (this._schema_type === undefined)? 'undefined': this._schema_type;
  };
  get internal_type(): string {
    return (this._internal_type === undefined)? 'undefined': this._internal_type;
  };
  get external_type(): string {
    return (this._external_type === undefined)? this.internal_type: this._external_type;
  };
  get decoder(): string {
    return (this._decoder === undefined)? `${this.schema_type}_${this.internal_type}`: this._decoder;
  };
  get type(): string {
    return (this._mode.internal)? this.internal_type: this.external_type;
  }
  get code():string {
    if (this._codes.length == 0) {
      return this.type;
    } else {
      return this._codes.join('\n');
    }
  }
  static walk(def: any, mode:any): TypeGenerator {
    const g = new TypeGenerator(mode);
    g.on_definition(def);
    return g;
  }
  on_definition(def: any) {
    this._schema_type = undefined;
    this._internal_type = 'undefined';
    this._decoder = undefined;
    if (def === undefined) {
      return;
    }
    if (def.$ref !== undefined) {
      const a = /^#\/(definitions|parameters)\/([a-zA-Z0-9_]+)$/.exec(def.$ref);
      if (a !== null && a.length === 3) {
        this._schema_type   = this._mode.swagger_dts_ns + '.' + a[2];
        this._internal_type = this._mode.swagger_dts_ns + '.' + a[2];
        return;
      }
    }

    if (def.type === undefined) {
      this._schema_type = undefined;
      this._internal_type = 'undefined';
    } else if (def.type == 'string') {
      this._schema_type = def.type;
      this._external_type = 'string';
      if (def.format === 'date' || def.format === 'date-time') {
        this._internal_type = 'Date';
      } else {
        this._internal_type = 'string';
      }
    } else if (def.type == 'integer') {
      this._schema_type = def.type;
      this._external_type = 'number';
      if ((def.format === undefined || def.format === 'int64') &&
          (def.maximum === undefined || Number.MAX_SAFE_INTEGER < def.maximum ||
           def.minimum === undefined || def.minimum < Number.MIN_SAFE_INTEGER))
      {
        this._internal_type = 'BigNumber';
      } else {
        this._internal_type = 'number';
      }
    } else if (def.type == 'number') {
      this._schema_type = def.type;
      this._internal_type = 'number';
    } else if (def.type == 'boolean') {
      this._schema_type = def.type;
      this._internal_type = 'boolean';
    } else if (def.type === 'array') {
      const subtype = TypeGenerator.walk(def.items, this._mode);
      this._schema_type = `array_${subtype.schema_type}`;
      this._internal_type = `${subtype.code}[]`;
      this._decoder = `array_${subtype.schema_type}_${subtype.code}`;
    } else if (def.type === 'object') {
      if (def.properties === undefined) {
        this._schema_type = def.type;
        this._internal_type = 'object';
        this._codes.push("{ }");
      } else {
        this._schema_type = def.type;
        this._internal_type = 'object';
        const props = def.properties;
        const subcodes = Object.keys(props).map((k) => {
          const p = props[k];
          const required =
            ((def.required && (0 <= def.required.indexOf(k))) || (p.required))? '': '?';
          const t = TypeGenerator.walk(def.properties[k], this._mode);
          return(`${k}${required}: ${t.code}`);
        });
        this._codes.push("{\n" + subcodes.join('\n') + "\n}");
      }
    }
  }
}


class Generator {
  static METHODS: string[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];
  static SWAGGER_DTS_NS = 'd';

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
    this.compiled = sw2.compileDocument(doc); // which internally calls json-schema-deref-sync
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
    this.render('header', {
      swagger_dts_ns: Generator.SWAGGER_DTS_NS,
    });

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

    const schema = p.schema || p;
    const g = TypeGenerator.walk(schema, {internal:false, swagger_dts_ns:Generator.SWAGGER_DTS_NS});
    if (p.in === undefined) {
      throw new Error(`the 'in' field of Parameter is not defined: ${p.name}: ${position}`);
    } else if (p.in === 'query') {
      ret.decoder = `decode_string_${g.decoder.toLowerCase()}_external`;
      ret.container = `query.${p.name}`;
    } else if (p.in === 'header' || p.in === 'path') {
      ret.decoder = `decode_string_${g.decoder.toLowerCase()}_external`;
      ret.container = `params.${p.name}`;
    } else if (p.in === 'body') {
      ret.decoder = `decode_json_${g.decoder.toLowerCase()}_external`;
      ret.container = 'request.body';
    } else {
      throw new Error(`the 'in' field of Parameter is unknown: ${p.in}`);
    }
    ret.type_code = g.code;
    ret.schema_code = JSON.stringify(schema);
    return ret;
  }
  parse_operation_response(status:string, res:sw2_schema.Response, position:string) {
    const schema = res.schema;
    const g = TypeGenerator.walk(schema, {internal:false, swagger_dts_ns:Generator.SWAGGER_DTS_NS});
    return {
      type_code: g.code,
      schema_code: JSON.stringify(schema),
      status: {
        raw: status,
        pascalcase: upperFirst(status),
      }
    };
  }
  on_operation(path: string, method: string, op: sw2_schema.Operation, cop: CompiledOperation) {
    //debug('resolved=' + JSON.stringify(cop.resolvedParameters));
    let render_opts:any = {
      method: {
        lower: method.toLowerCase(),
        upper: method.toUpperCase(),
      },
      path: {
        raw: path,
        basePath: this.doc.basePath,
        koaPath: path.replace(/\{([a-zA-Z0-9_]+)\}/g, ':$1'),
      },
      operationId: cop.operationId!,
    };

    const position=`path=${path}, method=${method}`;
    render_opts.parameters = cop.resolvedParameters.map((p:sw2_schema.Parameter) => {
      return this.parse_operation_parameter(p, position);
    });
    render_opts.responses = Object.keys(op.responses).map((status:string) => {
      const res = op.responses[status];
      return this.parse_operation_response(status, res, position);
    });
    render_opts.response_types_join = render_opts.responses.map((d:any) => {
      return `Response${d.status.pascalcase}`;
    }).join(' | ');
    this.render('operation', render_opts);
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

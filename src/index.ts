import * as create_debug from 'debug'
import * as fs from 'fs'
import * as sw2 from 'swagger2'
import * as sw2_schema from '../node_modules/swagger2/dist/schema'
import * as sw2_compiler from '../node_modules/swagger2/dist/compiler'

interface CompiledOperation extends sw2_schema.Operation {
  resolvedParameters: sw2_schema.Parameter[]
}

const debug = create_debug('debug')

class Generator {
  static METHODS: string[] = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch'
  ]
  static generate(doc: sw2_schema.Document, out: fs.WriteStream) {
    const g = new Generator(doc, out)
    g.on_root()
  }
  doc: sw2_schema.Document
  compiled: sw2.Compiled
  out: fs.WriteStream
  constructor(doc: sw2_schema.Document, out: fs.WriteStream) {
    this.doc = doc
    this.compiled = sw2.compileDocument(doc)
    this.out = out
  }

  on_root() {
    debug('on_root')
    //out.write('path=' + path + "\n");
    Object.keys(this.doc.paths).forEach(path => {
      debug('path=' + path)
      const path_item = this.doc.paths[path]
      const fullpath = this.doc.basePath ? this.doc.basePath + path : path
      const cpath = this.compiled(fullpath)
      if (cpath == null) {
        throw new Error('cannot found compiled path: ' + fullpath)
      }
      this.on_path(path, path_item, cpath!)
    })
  }
  on_path(
    path: string,
    item: sw2_schema.PathItem,
    cpath: sw2_compiler.CompiledPath
  ) {
    debug('on_path: ' + path)
    Generator.METHODS.forEach(method => {
      const op = item[method]
      if (op != null) {
        const cop = (cpath.path as any)[method]
        if (cop == null) {
          throw new Error(
            `cannot found compiled operator: path=${path}, method=${method}`
          )
        }
        this.on_operation(path, method, op, cop! as CompiledOperation)
      }
    })
  }
  on_operation(
    path: string,
    method: string,
    op: sw2_schema.Operation,
    cop: CompiledOperation
  ) {
    debug('resolved=' + JSON.stringify(cop.resolvedParameters))
  }
}

export function main(inpath: string, outpath: string) {
  const out = fs.createWriteStream(outpath, { flags: 'wx' })

  const doc = sw2.loadDocumentSync(inpath)
  if (!sw2.validateDocument(doc)) {
    throw Error(`validation failed: ${inpath}`)
  }
  Generator.generate(doc, out)
}

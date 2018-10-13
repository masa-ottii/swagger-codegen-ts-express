import * as create_debug from 'debug'
import * as fs from 'fs'
import * as sw2 from 'swagger2'
import * as schema from '../node_modules/swagger2/dist/schema'

interface CompiledOperation extends schema.Operation {
  resolvedParameters: schema.Parameter[]
}

const debug = create_debug('debug')

class Generator {
  static METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch']
  static generate(doc: schema.Document, out: fs.WriteStream) {
    const g = new Generator(doc, out)
    g.on_root()
  }
  doc: schema.Document
  compiled: sw2.Compiled
  out: fs.WriteStream

  constructor(doc: schema.Document, out: fs.WriteStream) {
    this.doc = doc
    this.compiled = sw2.compileDocument(doc)
    this.out = out
  }
  on_root() {
    debug('on_root')
    //out.write('path=' + path + "\n");
    Object.keys(this.doc.paths).forEach(path => {
      debug('path=' + path)
      const path_item = doc.paths[path]
      const fullpath = this.doc.basePath ? this.doc.basePath + path : path
      const compath = this.compiled(fullpath)
      if (comnpath == null) {
        throw new Error('cannot found compiled path: ' + fullpath)
      }
      this.on_path(path, path_item, compath!)
    })
  }
  on_path(path: string, item: schema.PathItem, compath: sw2.CompiledPath) {
    debug('on_path: ' + path)
    this.METHODS.forEach(method => {
      const op = item[method]
      if (op != null) {
        const comop = (compath.path as any)[method]
        if (comop == null) {
          throw new Error(
            `cannot found compiled operator: path=${path}, method=${method}`
          )
        }
        on_operation(path, method, op, comop! as CompiledOperation)
      }
    })
  }
  on_operation(
    path: string,
    method: string,
    op: schema.Operation,
    comop: CompiledOperation
  ) {
    debug('resolved=' + JSON.stringify(comop.resolvedParameters))
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

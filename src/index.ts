import * as create_debug from 'debug'
import * as fs from 'fs'
import * as sw2 from 'swagger2'

const debug = create_debug('debug')

function x(doc: sw2.Document, out: fs.WriteStream) {
  //out.write('path=' + path + "\n");
  const compiled = sw2.compileDocument(doc)
  Object.keys(doc.paths).forEach(path => {
    const methods = doc.paths[path]
    debug('path=' + path)
    const compath = compiled('/api-v1' + path)
    Object.keys(methods).forEach(method => {
      const operation = methods[method]
      debug('  method=' + method)
      debug('    opid=' + operation.operationId)
      debug('    parameters: ' + JSON.stringify(operation.parameters))
      debug('    res=' + operation.resolvedParameters)
      const compathmethod = (compath!.path as any)[method.toLowerCase()]
      debug('           com:' + JSON.stringify(compathmethod.parameters))
      debug(
        '      resolved=' + JSON.stringify(compathmethod.resolvedParameters)
      )
    })
  })
}

export function main(inpath: string, outpath: string) {
  const out = fs.createWriteStream(outpath, { flags: 'wx' })

  const doc = sw2.loadDocumentSync(inpath)
  if (!sw2.validateDocument(doc)) {
    throw Error(`validation failed: ${inpath}`)
  }
  x(doc, out!)
}

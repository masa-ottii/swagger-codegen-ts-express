import * as sw2 from 'swagger2'

export function main(path: string) {
  const doc = sw2.loadDocumentSync(path)
  if (!sw2.validateDocument(doc)) {
    throw Error(`validation failed: ${path}`)
  }
  Object.keys(doc.paths).forEach(path => {
    console.log('path=' + path)
  })
  const com = sw2.compileDocument(doc)
}

#!/usr/bin/env node

const swagger2  = require('swagger2');
const schema    = require('../node_modules/swagger2/src/schema.json');
const validator = require('is-my-json-valid');

const validate = validator(schema, {verbose:true});

const filename = process.argv[2];
const doc = swagger2.loadDocumentSync(filename)

if (!validate(doc)) {
  console.log('swagger validation failed: ' + filename);
  console.log(validate.errors);
  process.on('exit', () => { process.exit(1); });
}
if (!swagger2.compileDocument(doc)) {
  console.log('swagger compile failed: ' + filename);
  process.on('exit', () => { process.exit(1); });
}

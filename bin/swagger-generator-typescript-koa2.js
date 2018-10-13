#!/usr/bin/env node

const swgen = require('../dist');

function help() {
  console.log('swagger-generator-typescript-koa2.js <swagger> <output>')
}

function main() {
  const filepath = process.argv[2];
  if (filepath == null) {
    console.log('input filepath required');
    return help();
  }
  const outpath = process.argv[3];
  if (filepath == null) {
    console.log('output filepath required');
    return help();
  }
  swgen.main(filepath, outpath);
}

main();

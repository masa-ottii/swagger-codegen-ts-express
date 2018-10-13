#!/usr/bin/env node

const fs = require('fs');
const swgen = require('../dist');

function main() {
  const inpath = process.argv[2];
  const outpath = process.argv[3];
  if (inpath == null) {
    console.log('input filepath is required');
    return;
  }
  if (outpath == null) {
    console.log('output filepath is required');
    return;
  }

  swgen.main(inpath, outpath);
}

main();

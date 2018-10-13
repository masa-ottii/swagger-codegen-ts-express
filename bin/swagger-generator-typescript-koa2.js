#!/usr/bin/env node

const swgen = require('../dist');

function main() {
  const filepath = process.argv[2];
  if (filepath == null) {
    console.log('input filepath required');
    return;
  }
  swgen.main(filepath);
}

main();

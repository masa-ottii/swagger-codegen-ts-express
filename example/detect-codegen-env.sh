#!/bin/sh

PKG=swagger-codegen-typescript-koa2

PWD=$(dirname $0)
BASEDIR=$PWD/..
NODECONF=$BASEDIR/package.json

if [ ! -e $NODECONF ]; then
  ENV=external
else
  name=$(cat $NODECONF | jq '.name')
  if [ "x$name" = "x\"$PKG\"" ]; then
    ENV=internal
  else
    ENV=external
  fi
fi

echo -n $ENV

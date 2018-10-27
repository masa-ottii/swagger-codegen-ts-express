#!/bin/sh

PKG=swagger-codegen-typescript-koa2

PWD=$(dirname $0)
BASEDIR=$PWD/../..
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

case $ENV in
  internal) echo -n $BASEDIR ;;
  external) echo -n "./node_modules/swagger-codegen-typescript-koa2" ;;
esac

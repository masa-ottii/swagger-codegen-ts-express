#!/bin/sh

echo success
curl -X POST -H 'content-type: application/json' --data '{"foo":"xxx","bar":39}' http://localhost:10080/example-v1/parameters/types/object_body ; echo

echo success with unspecialized property
curl -X POST -H 'content-type: application/json' --data '{"foo":"xxx","bar":39,"baz":0}' http://localhost:10080/example-v1/parameters/types/object_body ; echo

echo fail. schema mismatch
curl -X POST -H 'content-type: application/json' --data '{"foo":"xxx","bar":"39","baz":0}' http://localhost:10080/example-v1/parameters/types/object_body ; echo

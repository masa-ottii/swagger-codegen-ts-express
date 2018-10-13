SRCS = src/index.ts
DSTS = dist/index.js

all: $(DSTS)

$(DSTS): $(SRCS)
	npm run build

test: $(DSTS)
	rm -f test.ts
	DEBUG=debug node bin/swagger-generator-typescript-koa2.js example/swagger/dist/example/swagger.yaml test.ts

clean:
	rm -rf dist

.PHONY: all test clean

TARGET = dist/index.js
DEPS = $(wildcard src/**.ts src/**.mustache)
TESTFILE = example/swagger/dist/example/swagger.yaml

all: $(TARGET)

$(TARGET): $(DEPS)
	npm run build

test: $(TARGET) $(TESTFILE)
	rm -f test.ts
	DEBUG=debug node bin/swagger-generator-typescript-koa2.js $(TESTFILE) test.ts

$(TESTFILE):
	$(MAKE) -C example/swagger

clean:
	rm -rf dist

.PHONY: all test clean

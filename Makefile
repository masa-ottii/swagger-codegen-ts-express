TARGET = dist/
DEPS = $(wildcard src/**.ts src/**.mustache)
TESTFILE = example/swagger/src/simple.yaml

all: $(TARGET)

$(TARGET): $(DEPS)
	npm run build

test: $(TARGET) $(TESTFILE)
	rm -f test.ts
	DEBUG=debug node dist/bin/swagger-codegen-ts-express.js $(TESTFILE) test.ts


$(TESTFILE):
	$(MAKE) -C example/swagger

clean:
	rm -rf dist

.PHONY: all test clean

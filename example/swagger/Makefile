TARGET = example
VALIDATOR = ./validate.js
CODEGEN = ../../dist/bin/swagger-codegen-typescript-koa2.js

SRCDIR = src
DSTDIR = dist/$(TARGET)
TMPDIR = tmp

SRCS   = $(wildcard $(SRCDIR)/**/*.yaml)

DST_SWAGGER   = $(DSTDIR)/swagger.yaml
DST_REDOC     = $(DSTDIR)/redoc/index.html
DST_SPECTACLE = $(DSTDIR)/spectacle/index.html
DST_DTS       = $(DSTDIR)/swagger.d.ts
DST_TS        = $(DSTDIR)/generated.ts
DST_JS        = $(DSTDIR)/index.js

all: validate redoc dts compile

validate: $(DST_SWAGGER)

swagger: $(TMPDIR)/$(DST_SWAGGER)

redoc: $(DST_REDOC)

spectacle: $(DST_SPECTACLE)

codegen: $(DST_TS) $(DST_DTS)

compile: $(DST_JS)

dts: $(DST_DTS)

$(DST_SWAGGER): $(TMPDIR)/$(DST_SWAGGER)
	$(VALIDATOR) $<
	@mkdir -p $$(dirname $@)
	cp $< $@

$(TMPDIR)/$(DST_SWAGGER): $(SRCS)
	@mkdir -p $$(dirname $@)
	npx swagger-merger -o $@ -i $(SRCDIR)/$(TARGET).yaml

$(DST_JS): $(DST_TS) $(DST_DTS)
	npm run build

$(DST_TS): $(TMPDIR)/$(DST_TS)
	node node_modules/prettier/bin-prettier.js $< > $@

$(TMPDIR)/$(DST_TS): $(DST_SWAGGER)
	$(CODEGEN) $< $@

$(DST_REDOC): $(DST_SWAGGER)
	@mkdir -p $$(dirname $@)
	npx redoc-cli \
	  bundle --options.pathInMiddlePanel --options.theme.breakpoints.medium=50rem \
	  -o $@ $<

$(DST_SPECTACLE): $(DST_SWAGGER)
	@mkdir -p $$(dirname $@)
	npx spectacle -t $$(dirname $(DST_SPECTACLE)) $<

$(DST_DTS): $(DST_SWAGGER)
	@mkdir -p $$(dirname $@)
	node node_modules/dtsgenerator/bin/dtsgen -o $@ -n $(TARGET) $<

clean:
	rm -rf $(DSTDIR) $(TMPDIR)

.PHONY: all validate swagger redoc spectacle dts

TARGET = example
VALIDATOR = ./validate.js

SRCDIR = src
DSTDIR = dist/$(TARGET)
TMPDIR = tmp

SRCS   = $(wildcard $(SRCDIR)/**/*.yaml)

DST_SWAGGER   = $(DSTDIR)/swagger.yaml
DST_REDOC     = $(DSTDIR)/redoc/index.html
DST_SPECTACLE = $(DSTDIR)/spectacle/index.html
DST_DTS       = $(DSTDIR)/index.d.ts

all: validate redoc dts

validate: $(DST_SWAGGER)

swagger: $(TMPDIR)/$(DST_SWAGGER)

redoc: $(DST_REDOC)

spectacle: $(DST_SPECTACLE)

dts: $(DST_DTS)

$(DST_SWAGGER): $(TMPDIR)/$(DST_SWAGGER)
	$(VALIDATOR) $<
	@mkdir -p $$(dirname $@)
	cp $< $@

$(TMPDIR)/$(DST_SWAGGER): $(SRCS)
	@mkdir -p $$(dirname $@)
	npx swagger-merger -o $@ -i $(SRCDIR)/$(TARGET).yaml

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
	npx dtsgenerator -o $@ -n $(TARGET) $<

clean:
	rm -rf $(DSTDIR) $(TMPDIR)

.PHONY: all validate swagger redoc spectacle dts

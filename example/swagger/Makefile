TARGETS = example simple
VALIDATOR = ./validate.js
CODEGEN = $(shell /bin/bash detect-codegen-dir.sh)/dist/bin/swagger-codegen-typescript-koa2.js
SWAGGER_MERGER = node node_modules/swagger-merger/bin/swagger-merger.js
PRETTIER = node node_modules/prettier/bin-prettier.js
DTSGEN = npx dtsgenerator@1.2.0
REDOC = node node_modules/redoc-cli/index.js
SPECTACLE = node node_modules/spectacle-docs/bin/spectacle.js
TSC = npx tsc

SRCDIR = src
DSTDIR = dist
TMPDIR = tmp

default: all

$(TARGETS):
	$(MAKE) all-$@

all redoc spectacle:
	@for t in $(TARGETS); do $(MAKE) $@-$$t; done

$(TARGETS:%=all-%):
	@t=$$(echo $@ | cut -d- -f 2); \
	for x in js; do $(MAKE) $$x-$$t; done

$(TARGETS:%=js-%):
	@t=$$(echo $@ | cut -d- -f 2); $(MAKE) $(DSTDIR)/$$t/js/index.js

$(TARGETS:%=ts-%):
	@t=$$(echo $@ | cut -d- -f 2); $(MAKE) $(DSTDIR)/$$t/ts/codegen.ts

$(TARGETS:%=swagger-%):
	@t=$$(echo $@ | cut -d- -f 2); $(MAKE) $(DSTDIR)/$$t/swagger.yaml

$(TARGETS:%=redoc-%):
	@t=$$(echo $@ | cut -d- -f 2); $(MAKE) $(DSTDIR)/$$t/redoc/index.html

$(TARGETS:%=spectacle-%):
	@t=$$(echo $@ | cut -d- -f 2); $(MAKE) $(DSTDIR)/$$t/spectacle/index.html

$(DSTDIR)/%/ts/swagger.d.ts: $(DSTDIR)/%/swagger.yaml
	t=$$(basename $$(dirname $$(dirname $@))); \
	$(DTSGEN) -o $@ -n "" $<

$(DSTDIR)/%/js/swagger.d.ts: $(DSTDIR)/%/ts/swagger.d.ts
	@mkdir -p $$(dirname $@)
	cp $< $@

$(DSTDIR)/%/js/index.js: $(DSTDIR)/%/ts/tsconfig.json $(DSTDIR)/%/ts/index.ts $(DSTDIR)/%/js/swagger.d.ts
	@mkdir -p $$(dirname $@)
	$(TSC) -p $<

$(DSTDIR)/%/ts/index.ts: $(DSTDIR)/%/ts/swagger.d.ts $(DSTDIR)/%/ts/index.d.ts $(DSTDIR)/%/ts/codegen.ts
	@t=$$(basename `dirname $@`); \
	rm -f $@; touch $@; \
	echo "export * from './swagger'" >> $@ ;\
	echo "export * from './codegen'" >> $@ ;\

$(DSTDIR)/%/ts/index.d.ts: $(DSTDIR)/%/ts/swagger.d.ts $(DSTDIR)/%/ts/codegen.ts
	@t=$$(basename `dirname $@`); \
	rm -f $@; touch $@; \
	echo "export * from './swagger'" >> $@ ;\
	echo "export * from './codegen'" >> $@ ;\

$(DSTDIR)/%/ts/tsconfig.json: tsconfig-tmpl.json
	@mkdir -p $$(dirname $@)
	cp $< $@

$(DSTDIR)/%/ts/codegen.ts: $(TMPDIR)/%.ts
	@mkdir -p $$(dirname $@)
	$(PRETTIER) $< > $@

$(TMPDIR)/%.ts: $(DSTDIR)/%/swagger.yaml
	@mkdir -p $$(dirname $@)
	$(CODEGEN) $< $@

$(DSTDIR)/%/swagger.yaml: $(TMPDIR)/%.yaml
	$(VALIDATOR) $<
	@mkdir -p $$(dirname $@)
	cp $< $@

$(TMPDIR)/%.yaml: $(SRCDIR)/%.yaml
	@mkdir -p $$(dirname $@)
	$(SWAGGER_MERGER) -o $@ -i $<

$(DSTDIR)/%/redoc/index.html: $(DSTDIR)/%/swagger.yaml
	@mkdir -p $$(dirname $@)
	$(REDOC) \
	  bundle --options.pathInMiddlePanel --options.theme.breakpoints.medium=50rem \
	  -o $@ $<

$(DSTDIR)/%/spectacle/index.html: $(DSTDIR)/%/swagger.yaml
	@mkdir -p $$(dirname $@)
	$(SPECTACLE) -t $$(dirname $@) $<

clean:
	rm -rf $(DSTDIR) $(TMPDIR)

.PHONY: all clean $(TARGETS) \
  $(TARGETS:%=all-%) \
  $(TARGETS:%=js-%) \
  $(TARGETS:%=ts-%) \
  $(TARGETS:%=swagger-%) \
  $(TARGETS:%=redoc-%) \
  $(TARGETS:%=spectacle-%) \

PRECIOUS: \
  $(TARGETS:%=$(TMPDIR)/%.yaml) \
  $(TARGETS:%=$(TMPDIR)/%.ts) \
  $(TARGETS:%=$(DSTDIR)/%/swagger.yaml) \
  $(TARGETS:%=$(DSTDIR)/%/ts/index.ts) \
  $(TARGETS:%=$(DSTDIR)/%/ts/swagger.d.ts) \
  $(TARGETS:%=$(DSTDIR)/%/ts/swagger.ts) \
  $(TARGETS:%=$(DSTDIR)/%/ts/index.d.ts) \
  $(TARGETS:%=$(DSTDIR)/%/ts/codegen.ts) \
  $(TARGETS:%=$(DSTDIR)/%/ts/swagger.d.ts) \
  $(TARGETS:%=$(DSTDIR)/%/ts/tsconfig.json) \
  $(TARGETS:%=$(DSTDIR)/%/js/index.js) \
  $(TARGETS:%=$(DSTDIR)/%/js/codegen.js) \
  $(TARGETS:%=$(DSTDIR)/%/js/index.d.ts) \
  $(TARGETS:%=$(DSTDIR)/%/js/codegen.d.ts) \
  $(TARGETS:%=$(DSTDIR)/%/js/swagger.d.ts) \

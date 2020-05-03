# Defining shell is necessary in order to modify PATH
SHELL := sh
export PATH := node_modules/.bin/:$(PATH)
export NODE_OPTIONS := --trace-deprecation

# On CI servers, use the `npm ci` installer to avoid introducing changes to the package-lock.json
# On developer machines, prefer the generally more flexible `npm install`. 💪
NPM_I := $(if $(CI), ci, install)

# Modify these variables in local.mk to add flags to the commands, ie.
# MOCHA_FLAGS += --reporter nyan
# Now mocha will be invoked with the extra flag and will show a nice nyan cat as progress bar 🎉
MOCHA_FLAGS :=
TSC_FLAGS :=
ESLINT_FLAGS :=
NPM_FLAGS :=

SRCFILES = $(shell utils/make/projectfiles.sh ts)
DSTFILES = $(patsubst %.ts, %.js, $(SRCFILES))
GITFILES = $(patsubst utils/githooks/%, .git/hooks/%, $(wildcard utils/githooks/*))
TSTFILES = "test/**/*.test.js"

# Do this when make is invoked without targets
all: compile $(GITFILES)


# GENERIC TARGETS

.buildstate:
	mkdir .buildstate

.buildstate/compile.make: node_modules tsconfig.json $(SRCFILES) .buildstate
	tsc $(TSC_FLAGS) && touch $@

node_modules: package.json
	npm $(NPM_I) $(NPM_FLAGS) && touch $@

# Default target for all possible git hooks
.git/hooks/%: utils/githooks/%
	cp $< $@

coverage/lcov.info: compile
	nyc mocha $(MOCHA_FLAGS) $(TSTFILES)


# TASK DEFINITIONS

compile: .buildstate/compile.make

coverage: coverage/lcov.info

install: node_modules $(GITFILES)

lint: force install
	eslint --cache --ext js,ts --report-unused-disable-directives $(ESLINT_FLAGS) .
	remark --quiet .

test: force compile
	mocha $(MOCHA_FLAGS) $(TSTFILES)

inspect: force compile
	mocha --inspect --inspect-brk $(MOCHA_FLAGS) $(TSTFILES)

watchcompile: force install
	tsc $(TSC_FLAGS) --watch

watch: force install
	mocha --reporter min $(MOCHA_FLAGS) --watch $(DSTFILES) $(TSTFILES)

unlock: pristine
	rm -f package-lock.json
	touch package.json

clean:
	rm -rf {.nyc_output,coverage,docs,.eslintcache}
	find . -not -path '*/node_modules/*' -name '*.log' -print -delete

distclean: clean
	rm -rf .buildstate
	rm -f $(shell ./utils/make/projectfiles.sh js)
	rm -f $(shell find src test -name "*.d.ts")
	rm -f $(shell ./utils/make/projectfiles.sh map)

pristine: distclean
	rm -rf node_modules

.PHONY: force

-include local.mk

NODE = node
TEST = ./node_modules/.bin/vows
TESTS ?= test/*-test.js

test:
	@NODE_ENV=test NODE_PATH=lib $(TEST) $(TEST_FLAGS) $(TESTS)

docs: docs/api.html

docs/api.html: lib/jsonrpc-tcp/*.js
	dox \
		--title JSONSP \
		--desc "JSON stream parser for Node.js" \
		$(shell find lib/jsonsp/* -type f) > $@

docclean:
	rm -f docs/*.{1,html}

.PHONY: test docs docclean

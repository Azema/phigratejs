BASE = .

ISTANBUL = istanbul
TEST_COMMAND = NODE_ENV=test mocha
COVERAGE_OPTS = --lines 95 --statements 90 --branches 80 --functions 90

main: test

cover:
	$(ISTANBUL) cover test/mocha/run.js

check-coverage:
	$(ISTANBUL) check-coverage $(COVERAGE_OPTS)

test: cover check-coverage

test-cov: cover check-coverage
	open coverage/lcov-report/index.html

test-acceptance:
	test/mocha/run.js -T acceptance


.PHONY: test
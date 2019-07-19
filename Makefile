SHELL=/bin/bash
UID=$(shell echo $${UID})

default: coverage lint

install:
	npm install

ci-install:
	npm ci

test:
	./node_modules/.bin/lab -t 100 -v -a @hapi/code test/

coverage:
	./node_modules/.bin/lab -t 100 -a @hapi/code test/

lint:
	./node_modules/.bin/eslint .
	
SHELL=/bin/bash
UID=$(shell echo $${UID})

default: cov lint

install:
	npm install

ci-install:
	npm ci

cov:
	./node_modules/.bin/lab -t 100 -v -a @hapi/code test/

lint:
	./node_modules/.bin/eslint .
	
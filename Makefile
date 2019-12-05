.PHONY :

lint_prettier:
	npm run prettier

fix_prettier:
	npm run prettier:write

lint: lint_prettier

fix: fix_prettier

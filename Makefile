.PHONY: prepare run

prepare:
	@export $$(grep -v '^#' .env | xargs 2>/dev/null || true) && node scripts/fetch-github-repos.mjs

run:
	bun dev

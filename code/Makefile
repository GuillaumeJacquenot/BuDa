.PHONY: all clean artifacts

all: src/js/elm.js

src/js/elm.js: src/*
	rm -rf elm-stuff/generated-code || true
	docker run -t --rm -v $(shell pwd):/work -u $(shell id -u):$(shell id -g) -w /work elm make --yes --warn src/Main.elm --output src/js/elm.js

artifacts: graphTool.zip

graphTool.zip: src/graphTool.html src/js/elm.js src/*.css src/*.png src/*.svg css/* graphTool/img/*
	zip -r -9 graphTool.zip graphTool/src/graphTool.html graphTool/src/js graphTool/src/css graphTool/src/*.png src/*/svg src/*.css src/*.js

clean:
	rm -rf src/js/elm.js graphTool.zip elm-stuff/generated-code elm-stuff/build-artifacts

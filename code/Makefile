.PHONY: all clean artifacts

all: js/elm.js

js/elm.js: src/*
	rm -rf elm-stuff/generated-code || true
	docker run -t --rm -v $(shell pwd):/work -u $(shell id -u):$(shell id -g) -w /work elm make --yes --warn src/Main.elm --output js/elm.js

artifacts: graphTool.zip

graphTool.zip: src/graphTool.html js/elm.js src/*.css src/*.png src/*.svg css/* graphTool/img/*
	zip -r -9 graphTool.zip src/graphTool.html js raphTool/src/css graphTool/src/*.png src/*/svg src/*.css src/*.js

clean:
	rm -rf js/elm.js graphTool.zip elm-stuff/generated-code elm-stuff/build-artifacts

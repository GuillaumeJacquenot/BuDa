.PHONY: all clean artifacts

all: src/js/elm.js

src/js/elm.js: src/*
	rm -rf elm-stuff/generated-code || true
	docker build -t graphtool-build .
	docker run -t --rm --name graphtool-build -v `pwd`:/work -u $(shell id -u):$(shell id -g) -w /work graphtool-build

artifacts: graphTool.zip

graphTool.zip: src/graphTool.html src/js/elm.js src/*.css src/*.png src/*.svg css/* graphTool/img/*
	zip -r -9 graphTool.zip graphTool/src/graphTool.html graphTool/src/js graphTool/src/css graphTool/src/*.png src/*/svg src/*.css src/*.js

clean:
	rm -rf src/js/elm.js graphTool.zip elm-stuff/generated-code elm-stuff/build-artifacts

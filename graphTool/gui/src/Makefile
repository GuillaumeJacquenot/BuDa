FILENAME := ../graphTool-bin$(shell date +_%Y%m%d_%Hh%M).tar.gz
FILENAME2 := ../graphTool-src-bin$(shell date +_%Y%m%d_%Hh%M).tar.gz
JSFILES = js/*.js
SAMPLES = 
IMAGES = *.svg *.png
BINARIES = graphTool.html graphTool.css cytostylesheet.css maia.css mainstyle.css elm.js $(JSFILES) $(IMAGES) $(SAMPLES)
SRC_BINARIES = $(BINARIES) *.elm elm-package.json Makefile

all : clean test app
	elm-make Main.elm --output elm.js --yes

app : 
	elm-make Main.elm --output elm.js --yes

test: clean-test
	elm-test

clean:
	rm -rf elm-stuff/build-artifacts/

clean-test:
	rm -rf tests/elm-stuff/build-artifacts/

build: $(BINARIES)

	tar -cvzf $(FILENAME) $(BINARIES)

build-src: $(SRC_BINARIES)
	tar -cvzf $(FILENAME2) $(SRC_BINARIES)

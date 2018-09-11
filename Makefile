BASENAME=holiship
FILENAME := ./$(BASENAME)-bin$(shell date +_%Y%m%d_%Hh%M).tar.gz
NETWORK=hnet

all:run

stop:
	cd mqreceiver && make stop && cd ..
	cd nginx && make stop && cd ..
	cd graphTool && make stop && cd ..
	# cd elm && make stop && cd ..
	cd angular && make stop && cd ..
	cd neo4j && make stop && cd ..
	cd rabbitmq && make stop && cd ..
	# docker network rm $(NETWORK)

run: stop
	export NETWORK=hnet
	# docker network create $(NETWORK)
	cd rabbitmq && make run && cd ..
	cd neo4j && make run && cd ..
	cd angular && make run && cd ..
	# cd elm && make run && cd ..
	cd graphTool && make run && cd ..
	cd nginx && make run && cd ..
	sleep 10
	cd mqreceiver && make run && cd ..


GRAPHTOOL_BINARIES=./graphTool/Makefile ./graphTool/run ./graphTool/gui/src/js ./graphTool/gui/src/LogoSirehna_DC.png ./graphTool/gui/src/elm.js ./graphTool/gui/src/elm-package.json ./graphTool/gui/src/*.css ./graphTool/gui/src/graphTool.html
BINARIES=./angular/ ./elm Makefile ./mqreceiver/ ./neo4j/ ./rabbitmq/ ./nginx $(GRAPHTOOL_BINARIES)


archive:
	tar -cvzf $(FILENAME) $(BINARIES)

build:
	cd mqreceiver && make build && cd ..
	cd nginx && make build && cd ..
	cd graphTool && make build && cd ..
	# cd elm && make build && cd ..
	cd angular && make build && cd ..
	cd rabbitmq && make build && cd ..

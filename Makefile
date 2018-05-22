all:run

stop:
	cd nginx && make stop && cd ..
	# cd elm && make stop && cd ..
	cd graphTool && make stop && cd ..
	cd angular && make stop && cd ..
	cd neo4j && make stop && cd ..
	cd rabbitmq && make stop && cd ..

run: stop
	cd rabbitmq && make run && cd ..
	cd neo4j && make run && cd ..
	cd angular && make run && cd ..
	# cd elm && make run && cd ..
	cd graphTool && make run && cd ..
	cd nginx && make run && cd ..

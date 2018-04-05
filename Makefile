all:run

stop:
	cd elm && make stop && cd ..
	cd nginx && make stop && cd ..
	cd rabbitmq && make stop && cd ..
	cd graphTool && make stop && cd ..

run: stop
	cd elm && make run && cd ..
	cd rabbitmq && make run && cd ..
	cd graphTool && make run && cd ..
	cd nginx && make run && cd ..

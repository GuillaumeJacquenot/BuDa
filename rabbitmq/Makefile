IMAGE_NAME=holiship-rabbitmq

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

run: stop
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .
	docker run -d --hostname holiship-rabbitmq --net holiship-network --name $(IMAGE_NAME) -p 15675:15675 -p 5672:5672 -p 15672:15672 -t $(IMAGE_NAME)

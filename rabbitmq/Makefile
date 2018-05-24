IMAGE_NAME=hrabbitmq

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

build:
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .

run: stop build	
	docker run -d --network $(NETWORK) --name $(IMAGE_NAME) -p 15675:15675 -p 5672:5672 -p 15672:15672 -t $(IMAGE_NAME)

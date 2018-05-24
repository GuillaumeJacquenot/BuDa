IMAGE_NAME=hscenariotool

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

build:
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .

run: stop
	# docker build -t $(IMAGE_NAME) -f run/Dockerfile .
	docker run -d --network $(NETWORK) --name $(IMAGE_NAME) -p 8050:8050 -t $(IMAGE_NAME)

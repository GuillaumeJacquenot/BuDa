IMAGE_NAME=hmqreceiver

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

build:
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .

run: stop build
	docker run -d --network $(NETWORK) --name $(IMAGE_NAME) -p 3000:3000 -t $(IMAGE_NAME) node mqreceiver.js

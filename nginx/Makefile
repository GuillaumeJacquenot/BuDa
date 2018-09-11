IMAGE_NAME=hnginx

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

build:
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .

run: stop build
	docker run -d --network $(NETWORK) --name $(IMAGE_NAME) -p 80:80 -t $(IMAGE_NAME)

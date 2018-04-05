IMAGE_NAME=holiship-nginx
SERVICE_NAME=holiship-nginx

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null


run: stop
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .
	docker run -d --hostname holiship-proxy --net holiship-network --name $(SERVICE_NAME) -p 80:80 -t $(IMAGE_NAME)

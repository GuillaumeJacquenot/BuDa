IMAGE_NAME=holiship-graphtool

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

run: stop
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .
	docker run -d --hostname holiship-graphtool --net holiship-network --name $(IMAGE_NAME) -p 8080:8080 -t $(IMAGE_NAME)

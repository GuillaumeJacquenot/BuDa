IMAGE_NAME=holiship-elm

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

run: stop
	docker build -t $(IMAGE_NAME) -f run/Dockerfile .
	cd ../graphTool/gui/src
	docker run --rm -v "$(shell pwd)/../graphTool/gui/src:/code" -w "/code" -e "HOME=/tmp" -p 8000:8000 -i -t $(IMAGE_NAME) make Main.elm --output elm.js --yes

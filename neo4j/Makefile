# IMAGE_NAME=holiship-neo4j
IMAGE_NAME=holiship-neo4j

stop:
	docker rm -f $(IMAGE_NAME) || true 2> /dev/null

# build:
# 	docker build -t $(IMAGE_NAME) -f run/Dockerfile .

run: stop
	docker run -d -v neo4j-vol:/data --hostname holiship-neo4j --net holiship-network --name $(IMAGE_NAME) -p 7474:7474 -p 7687:7687 neo4j:3.3.5

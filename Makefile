PROJECT=red-gql
PARENT=red

REGISTRY=spring-docker.jfrog.io
IMAGE_NAME=$(REGISTRY)/$(PARENT)/$(PROJECT)
IMAGE_LATEST=$(IMAGE_NAME):latest
GIT_HASH=$(shell git rev-parse --short HEAD)
FULL_NAME=$(IMAGE_NAME):$(GIT_HASH)

# test if the make is running inside a Jenkins, then set different network options than on Docker for Mac
ifdef BUILD_NUMBER
    HOSTNAME=$(shell hostname)
    NETWORK=$(shell docker ps -q --filter 'label=io.kubernetes.pod.name=$(HOSTNAME)' -n1)
    DOCKER_OPT_ARGS=--pull --network=container:$(NETWORK)
else
	DOCKER_OPT_ARGS=--pull
endif

.DEFAULT_GOAL: build

.PHONY: build
build:
	docker build $(DOCKER_OPT_ARGS) --build-arg GIT_USERNAME=$(GIT_USERNAME) --build-arg GIT_PASSWORD=$(GIT_PASSWORD) --build-arg PROJECT=$(PROJECT) --build-arg ARTICLE_GRAPHQL_ENDPOINT=$(ARTICLE_GRAPHQL_ENDPOINT) --build-arg ARTICLE_GRAPHQL_TOKEN=$(ARTICLE_GRAPHQL_TOKEN) --build-arg IMAGE_HOST=$(IMAGE_HOST) --build-arg LOG_LEVEL=$(LOG_LEVEL) --build-arg NODE_ENV=$(NODE_ENV) -t $(FULL_NAME) .
	docker tag $(FULL_NAME) $(IMAGE_LATEST)

.PHONY: release
release: build
	docker push $(IMAGE_LATEST)
	docker push $(FULL_NAME)

.PHONY: gettag
gettag:
	@echo $(GIT_HASH)

.PHONY: run
run: build
	docker run $(IMAGE_LATEST)


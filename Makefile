PROJECT=red-gql
PARENT=red

REGISTRY=spring-docker.jfrog.io
IMAGE_NAME=$(REGISTRY)/$(PARENT)/$(PROJECT)
IMAGE_LATEST=$(IMAGE_NAME):latest
GIT_HASH=$(shell git rev-parse --short HEAD)
FULL_NAME=$(IMAGE_NAME):$(GIT_HASH)

.DEFAULT_GOAL: build
DOCKER_OPT_ARGS=--pull

.PHONY: build
build:
	docker build $(DOCKER_OPT_ARGS) --build-arg PROJECT=$(PROJECT) -t $(FULL_NAME) .
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

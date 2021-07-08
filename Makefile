PREFIX=github.com/kwkoo
PACKAGE=go-quiz
BASE:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
COVERAGEOUTPUT=coverage.out
COVERAGEHTML=coverage.html
IMAGENAME="kwkoo/$(PACKAGE)"
VERSION="0.1"

.PHONY: run build clean test coverage image runcontainer
run:
	@go run main.go -docroot $(BASE)/docroot

build:
	@echo "Building..."
	@go build -o $(BASE)/bin/$(PACKAGE)

clean:
	rm -f \
	  $(BASE)/bin/$(PACKAGE) \
	  $(BASE)/$(COVERAGEOUTPUT) \
	  $(BASE)/$(COVERAGEHTML)

test:
	@go clean -testcache
	@go test -v $(PREFIX)/$(PACKAGE)/pkg

coverage:
	@go test $(PREFIX)/$(PACKAGE)/pkg -cover -coverprofile=$(BASE)/$(COVERAGEOUTPUT)
	@go tool cover -html=$(BASE)/$(COVERAGEOUTPUT) -o $(BASE)/$(COVERAGEHTML)
	open $(BASE)/$(COVERAGEHTML)

image: 
	docker build --rm -t $(IMAGENAME):$(VERSION) $(BASE)

runcontainer:
	docker run \
	  --rm \
	  -it \
	  --name $(PACKAGE) \
	  -p 8080:8080 \
	  -e TZ=Asia/Singapore \
	  $(IMAGENAME):$(VERSION)

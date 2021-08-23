PREFIX=github.com/kwkoo
PACKAGE=go-quiz
BASE:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
COVERAGEOUTPUT=coverage.out
COVERAGEHTML=coverage.html
IMAGENAME="ghcr.io/kwkoo/$(PACKAGE)"
VERSION="0.1"
ADMINPASSWORD="password"
SESSIONTIMEOUT=300

.PHONY: run build clean test coverage image runcontainer redis importquizzes importquizzesocp
run:
	@ADMINPASSWORD="$(ADMINPASSWORD)" SESSIONTIMEOUT=$(SESSIONTIMEOUT) go run main.go -docroot $(BASE)/docroot

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
	docker push $(IMAGENAME):$(VERSION)

runcontainer:
	docker run \
	  --rm \
	  -it \
	  --name $(PACKAGE) \
	  -p 8080:8080 \
	  -e TZ=Asia/Singapore \
	  -e ADMINPASSWORD="$(ADMINPASSWORD)" \
	  $(IMAGENAME):$(VERSION)

redis:
	docker run \
	  --rm \
	  -it \
	  --name redis \
	  -p 6379:6379 \
	  redis:5

importquizzes:
	@curl -XPUT -u admin:$(ADMINPASSWORD) -d @$(BASE)/quizzes.json http://localhost:8080/api/quiz/bulk

importquizzesocp:
	@curl -XPUT -u admin:myquizpassword -d @$(BASE)/quizzes.json https://`oc get route/quiz -o jsonpath='{.spec.host}'`/api/quiz/bulk

importquizzesk8s:
	@curl -XPUT -u admin:myquizpassword -d @$(BASE)/quizzes.json http://`minikube ip`:30080/api/quiz/bulk

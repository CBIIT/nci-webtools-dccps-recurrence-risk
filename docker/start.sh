#!/bin/sh

docker rm -f RecurrenceBackend
docker rm -f RecurrenceFrontend

docker build -t recurrence:backend -f backend.dockerfile ..

docker build -t recurrence:frontend -f frontend.dockerfile ..

docker run -d --name RecurrenceBackend -e PORT=8030 recurrence:backend

docker run -d --name RecurrenceFrontend -p 9000:80 -e API_HOST=http://RecurrenceBackend:8030 --link RecurrenceBackend recurrence:frontend
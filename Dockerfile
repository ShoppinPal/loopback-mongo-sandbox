# you can get details about the following image from https://hub.docker.com/_/node/
FROM node:0.10.36

RUN apt-get -y update
RUN apt-get install -y tree
RUN apt-get install -y vim

# https://github.com/dockerfile/mariadb/issues/3
ENV TERM=xterm

# https://github.com/jfrazelle/dockerfiles/issues/12
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y less

RUN mkdir -p /apps/loopback-mongo-sandbox
WORKDIR /apps/loopback-mongo-sandbox

#COPY . /apps/loopback-mongo-sandbox

EXPOSE 3000
CMD [ "node","server/server.js" ]

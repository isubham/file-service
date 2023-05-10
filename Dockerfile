FROM node:lts-alpine

RUN apk --no-cache -U upgrade
RUN apk update && apk add bash 
RUN apk add --update coreutils
RUN apk add openssh-client

WORKDIR /usr/src

COPY . .

CMD ["npm", "run", "start"]
EXPOSE 2000

FROM node:8.6 as node

WORKDIR /app

COPY ./package.json /app

RUN npm install

COPY ./mqreceiver.js /app

EXPOSE 3000

ENTRYPOINT ["node", "mqreceiver.js"]

# Stage 0, based on Node.js, to build and compile Angular
FROM node:8.6 as node

WORKDIR /app

COPY ./holiship/package.json /app

RUN npm install
RUN npm install -g @angular/cli

ADD ./holiship/src /app/src
COPY ./holiship/firebase.json /app
COPY ./holiship/karma.conf.js /app
COPY ./holiship/mqreceiver.js /app
COPY ./holiship/protractor.conf.js /app
COPY ./holiship/tsconfig.json /app
COPY ./holiship/tslint.json /app
COPY ./holiship/.angular-cli.json /app


ARG env=dev

#RUN npm run build -- --prod --environment $env
RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.13

EXPOSE 8050

COPY --from=node /app/dist/ /usr/share/nginx/html

COPY ./nginx-custom.conf /etc/nginx/nginx.conf

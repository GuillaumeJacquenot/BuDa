FROM nginx:1.13.9-alpine

EXPOSE 8080

ADD run/nginx.conf /etc/nginx/nginx.conf

ADD gui/src/*.css /app/
COPY gui/src/elm.js /app
COPY gui/src/graphTool.html /app/index.html
COPY gui/src/LogoSirehna_DC.png /app
ADD gui/src/js/*.js /app/js/

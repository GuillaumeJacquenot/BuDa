FROM nginx:1.13.6-alpine

EXPOSE 8080
ADD run/nginx.conf /etc/nginx/nginx.conf


ADD gui/src/js/cytoutils.js /app/js/cytoutils.js
ADD gui/src/graphTool.html /app/index.html

COPY gui/src/cytostylesheet.css /app
COPY gui/src/graphTool.css /app
COPY gui/src/maia.css /app
COPY gui/src/mainstyle.css /app


COPY gui/src/elm.js /app
COPY gui/src/js/base64ToBlob.js /app/js
COPY gui/src/js/cytoscape.js /app/js
COPY gui/src/js/dagre.js /app/js
COPY gui/src/js/FileSaver.js /app/js
COPY gui/src/js/loadFile.js /app/js
COPY gui/src/js/mqtt.min.js /app/js
COPY gui/src/js/cytoscape-canvas.js /app/js
COPY gui/src/js/cytoscape-svg-convertor.js /app/js
COPY gui/src/js/download.js /app/js
COPY gui/src/js/importFile.js /app/js  
COPY gui/src/js/loadGeometry.js /app/js
COPY gui/src/js/mqtt_ports.js /app/js
COPY gui/src/js/cytoscape-dagre.js /app/js
COPY gui/src/js/cytoutils.js /app/js  
COPY gui/src/js/elmrabbitmq.js /app/js
COPY gui/src/js/jquery-2.2.4.min.js /app/js
COPY gui/src/js/load-image.js /app/js
COPY gui/src/js/svg.js /app/js

COPY gui/src/LogoSirehna_DC.png /app


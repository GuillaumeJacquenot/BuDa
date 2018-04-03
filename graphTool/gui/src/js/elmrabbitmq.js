'use strict';

var globals = {
  url : null // url = 'mqtt://' + host + ':' + port + '/ws';
  , connected_flag : 0
  , client : null
  , connectionType : "Producer"
  , clientId: null
  , message : null
  , topic : null
};

function disconnectMQTT() {
  var client = globals.client;
  if(client!=null){
      client.end();
  }
  return false;
}

function connectMQTT() {
    console.log ("ask for connection ...");
    if(globals.connected_flag==0) {
        var coptions = {};
        if(globals.connectionType=="Consumer") {
          var cId = globals.clientId;
          coptions = {clientId: cId, clean:false};
        }
        var client = globals.client = mqtt.connect(globals.url, coptions);

        client.on('connect', function (connack) {
          console.log ("client connected");
          globals.connected_flag=1;
        });

        client.on('close', function() {
          console.log ("client close");
          globals.connected_flag=0;
        });

        client.on('message', function (topic, message) {
          // message is Buffer
          console.log(message.toString());
          app_port_mqttFromJS(message);
       });


    }

    return false;
}

function subscribeToTopic(topic) {
  var client = globals.client;
  client.subscribe(topic, {qos:1});
  return false;
}

function unsubscribeToTopic(topic) {
  var client = globals.client;
  client.unsubscribe(topic);
  return false;
}

function sendDataToMQTT(obj) {
  UpdateOptions(obj);
  var topic = globals.topic;
  var message = JSON.stringify(obj.message);
  console.log ("sendDataToMQTT: " + topic + ', ' + message );

  var client = globals.client;
  if(client!=null){
      client.publish(topic, message, {qos: 1});
  }
  return false;
}

function UpdateOptions(obj) {
  globals.url = obj.mqtt.url;
  globals.connectionType = obj.mqtt.connectionType;
  globals.clientId =obj.mqtt.clientId;
  globals.topic = obj.mqtt.topic;

  return false;
}

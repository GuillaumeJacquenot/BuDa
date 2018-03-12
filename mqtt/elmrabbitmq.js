'use strict';

var globals = {
  url : null // url = 'mqtt://' + host + ':' + port + '/ws';
  , connected_flag : 0
  , client : null
  , consumer : false
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
    if(globals.connected_flag==0) {
        console.log ("ask for connection ...");
        var coptions = {};
        if(globals.consumer==true) {
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
          //app_port_sendToElm(message.toString());
       });


    }

    return false;
}

function subscribeToTopic(topic,value) {
  var client = globals.client;
  if(value==true) {
      client.subscribe(topic, {qos:1});
  }
  else {
    client.unsubscribe(topic);
    //console.log ("call to unsubscribe");
  }
  return false;
}

function sendDataToMQTT(word) {
  var obj = JSON.parse(word);

  globals.url = obj["mqtt"]["url"];
  globals.consumer = obj["mqtt"]["consumer"];
  globals.clientId =obj["mqtt"]["clientId"];
  globals.topic = obj["mqtt"]["topic"];


  var topic = globals.topic;
  var message = JSON.stringify(obj["message"]);

  console.log ("sendDataToMQTT: " + topic + ', ' + message );

  try {
    var client = globals.client;
    if(client!=null){
        client.publish(topic, message, {qos: 1});
    }
  }
  catch(e) {
    console.log("error: " + e.message);
  }
  return false;
}

function UpdateOptions(word) {
  var obj = JSON.parse(word);

  globals.url = obj["mqtt"]["url"];
  globals.consumer = obj["mqtt"]["consumer"];
  globals.clientId =obj["mqtt"]["clientId"];
  globals.topic = obj["mqtt"]["topic"];

  return false;
}

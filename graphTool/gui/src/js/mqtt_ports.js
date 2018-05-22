app.ports.mqtt2JS.subscribe(function(value) {
  try {
    var tag = value["tag"];
    var data = value["data"];

    if(tag == "MqttConnect")
    {
        UpdateOptions(data);
        connectMQTT();
    }
    else if(tag == "MqttDisconnect") {
      disconnectMQTT();
    }
    else if(tag == "MqttNotify") {
      sendDataToMQTT(data);
    }
    else if(tag == "MqttSubscribeToTopic") {
      subscribeToTopic(data);
    }
    else if(tag == "MqttUnsubscribeToTopic") {
      unsubscribeToTopic(data);
    }
  }
  catch(e) {
    console.log("error: " + e.message);
  }

  return false;
});


function app_port_mqttFromJS(msg) {
  //app.ports.mqttFromJS.send({ tag="MqttMessage", data= msg });
  console.log ("receive msg" + msg);

  return false;
}

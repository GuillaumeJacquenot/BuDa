# Exemple de consommateur


```javascript
var host='130.66.124.234';
var port=15675;
var client = mqtt.connect('mqtt://host:port/ws', {clientId: 'alan', clean:false});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString());
});

client.subscribe('toto', {qos:1});
```


# Exemple de producteur

```javascript
var host='130.66.124.234';
var port=15675;
var client = mqtt.connect('mqtt://host:port/ws', {clientId: 'alan'});

var send = function (message) {
  client.publish('toto', message, {qos: 1});
};
```

# Principe de fonctionnement


Le consumer `c1(clientId: alan)` se connecte une premiere fois au serveur, la queue qc1 est crée.
si le paramètre clean vaut false, alors la queue est persistante.
=> La queue qc1 (mqtt-subscription-alanqos1) est crée et ne sera pas détruite quand le consumer c1 se deconnectera

Remarque : Le nom de la queue suit le schéma : 'mqtt-subscription-'' + clientId + 'qos' + qos


Le consumer s'abonne au topic 'toto'

Si un producer p1 publie sur le topic 'toto', le message sera transferé dans la queue mqtt-subscription-alanqos1
Deux cas sont possibles
  1. Le consumer c1 est connecté, alors il recevra directement les messages publiés par le producer p1
  2. Le consumer c1 est déconnecté, les messages publiés par le producer p1 seront transferés dans la queue qc1.
     Lorsque le consumer c1 se reconnectera, il recevra tous les messages de la queue qc1.


# Test offline

1. Préparation du test : on suppose que le consumer c1 s'est connecté au serveur une première fois, et donc que
la queue qc1 existe.
2. On arrète le serveur. (sudo docker stop 9ef54688e642)
3. On publie 10 messages offline avec le producer p1.
4. On relance le serveur.(sudo docker restart 9ef54688e642)
5. On vérifie la présence des 10 messages dans la queue cq1.
6. on connecte le consumer c1. La queue cq1 se vide. Les 10 messages sont reçus par le consumer c1.
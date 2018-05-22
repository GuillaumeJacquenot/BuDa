var app = require('express')();
var http = require('http').Server(app);

var amqp = require('amqplib/callback_api');
var io = require('socket.io')(http);

amqp.connect('amqp://0.0.0.0:5672', function(err, conn) {
  if(err) {
    console.error('error => ', err);
    return;
  }
    // conn.createChannel(function(err, ch) {
    //     var q = 'hello';
    //
    //     ch.assertQueue(q, {durable: false});
    //     console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    //     ch.consume(q, function(msg) {
    //         console.log(" [x] Received %s", msg.content.toString());
    //         io.emit('newMessage', msg.content.toString());
    //     }, {noAck: true});
    // });

  conn.createChannel(function(err, ch) {
    var q = 'object';

    // abonnement topic '*.*.node.*'
    ch.assertQueue(q, {durable: false}, function(err, qq){
      var key = "*.*.node.*";
      var ex = 'amq.topic';
      ch.bindQueue(qq.queue, ex, key);
    });


    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content);
      io.emit('newObj', msg.content.toString());
    }, {noAck: true});
  });
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('newMessage', 'test');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

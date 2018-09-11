import { Injectable, Component } from '@angular/core';

import { ExternalMessagesService } from "./external-messages.service";

// import ampq = require('amqplib/callback_api');

import * as io from 'socket.io-client';

@Injectable()
export class RabbitMqReceiverService {
  private socket: SocketIOClient.Socket;

  constructor(extMsgServ: ExternalMessagesService) {
    // console.log('ampq => ', ampq);
    this.socket = io('http://localhost:3000');

    this.socket.on('newMessage', msg => {
      console.log(msg);
    });

    this.socket.on('newObj', msg => {
      console.log('newObj =>', msg);
      try {
        extMsgServ.getMessage(JSON.parse(msg));
      } catch (err) {
        console.log(err);
      }
    });


  //   ampq.connect('amqp://0.0.0.0:5672', function(err, conn) {
  //     conn.createChannel(function(err, ch) {
  //       let q = 'hello';
  //
  //       ch.assertQueue(q, {durable: false});
  //       console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
  //       ch.consume(q, function(msg) {
  //         console.log(' [x] Received %s', msg.content.toString());
  //       }, {noAck: true});
  //     });
  //   });
  }
}





// import { Injectable, Component, OnDestroy } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
// import {Message} from '@stomp/stompjs';
//
// import { Subscription } from 'rxjs/Subscription';
// import {StompService} from '@stomp/ng2-stompjs';
//
// // import { connect } from 'amqplib/callback_api';
// // import * as Amqp from 'amqp-ts';
// // declare var Ampq;
//
// // import { StompService } from 'ng2-stomp-service';
//
// import * as Stomp from 'stompjs';
//
// const ws = new WebSocket('ws://127.0.0.1:15674/ws');
// const client = Stomp.over(ws);
//
// @Injectable()
// export class RabbitMqReceiverService implements OnDestroy {
//
//   // Stream of messages
//   private subscription: Subscription;
//   public messages: Observable<Message>;
//
//   // Subscription status
//   public subscribed: boolean;
//
//   // Array of historic message (bodies)
//   public mq: Array<string> = [];
//
//   // A count of messages received
//   public count = 0;
//
//   private _counter = 1;
//
//   /** Constructor */
//   constructor(private _stompService: StompService) {
//     client.connect('guest', '1111', this.onConnect, this.onError, '/');
//   }
//
//   public onConnect () {
//     console.log('connected');
//   }
//
//   public onError() {
//     console.log('error');
//   }
//
//   public subscribe() {
//     if (this.subscribed) {
//       return;
//     }
//
//     // Stream of messages
//     this.messages = this._stompService.subscribe('/topic/ng-demo-sub');
//
//     // Subscribe a function to be run on_next message
//     this.subscription = this.messages.subscribe(this.on_next);
//
//     this.subscribed = true;
//   }
//
//   public unsubscribe() {
//     if (!this.subscribed) {
//       return;
//     }
//
//     // This will internally unsubscribe from Stomp Broker
//     // There are two subscriptions - one created explicitly, the other created in the template by use of 'async'
//     this.subscription.unsubscribe();
//     this.subscription = null;
//     this.messages = null;
//
//     this.subscribed = false;
//   }
//
//   ngOnInit() {
//     this.subscribed = false;
//
//     // Store local reference to Observable
//     // for use with template ( | async )
//     this.subscribe();
//   }
//
//   ngOnDestroy() {
//     this.unsubscribe();
//   }
//
//   public onSendMessage() {
//     const _getRandomInt = (min, max) => {
//       return Math.floor(Math.random() * (max - min + 1)) + min;
//     };
//     this._stompService.publish('/topic/ng-demo-sub',
//       `{ type: "Test Message", data: [ ${this._counter}, ${_getRandomInt(1, 100)}, ${_getRandomInt(1, 100)}] }`);
//
//     this._counter++;
//   }
//
//   /** Consume a message from the _stompService */
//   // public on_next = (message: Message) => {
//   //
//   //   // Store message in "historic messages" queue
//   //   this.mq.push(message.body + '\n');
//   //
//   //   // Count it
//   //   this.count++;
//   //
//   //   // Log it to the console
//   //   console.log(message);
//   // }
//
//   }

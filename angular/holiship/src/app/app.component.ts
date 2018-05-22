import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NeoConnectService } from '../services/neo-connect.service';
import { RabbitMqReceiverService} from "../services/rabbit-mq-receiver.service";

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Holiship';

  public errorShowing = false;
  public error = '';

  isConnErr = false;
  subscription: Subscription;

  constructor(public http: HttpClient, public neoConn: NeoConnectService, rmqServ: RabbitMqReceiverService) {}

  openErrModal(err) {
    this.error = err;
    this.errorShowing = true;
  }

  closeErrModal() {
    this.errorShowing = false;
    this.error = '';
  }

  ngOnInit() {
    this.subscription = this.neoConn.ConnObservable
      .subscribe(conn => {
        console.log('SUBSCRIBTION', conn);
        if (conn.error) {
          // this.subscription.unsubscribe();
          this.error = conn.msg;
          this.isConnErr = true;
          // this.openErrModal(this.error);
        }
      });

    let exists = false;
    const user = localStorage.getItem('user');

    if (user) {
      this.neoConn.checkUserExistence(user).subscribe({
        onNext: record => {
          exists = true;
        },
        onCompleted: summary => {
          if (!exists) {
            localStorage.removeItem('user');
            window.location.replace('/login');
          }
        },
        onError: error => {
          console.log(error);
        }
      });
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }
}

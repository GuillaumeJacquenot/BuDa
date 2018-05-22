import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NeoConnectService } from '../../services/neo-connect.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public errorShowing = false;
  public error = '';
  public form: FormGroup;

  usersArr: any[] = [];
  showCreatingUser = false;

  constructor(public router: Router,
              private _fb: FormBuilder,
              private neoConn: NeoConnectService,
              private zone: NgZone) { }

  goToProjList() {
    this.router.navigate(['']);
  }

  loginUser(login, password) {
    localStorage.setItem('user', '');
    this.neoConn.auth(login, password).subscribe({
      onNext: record => {
        localStorage.setItem('user', record.get('user').properties.login);
        console.log(record.get('user').properties.login);
      },
      onCompleted: summary => {
        console.log(summary);
        this.zone.run(() => {
          if (localStorage.getItem('user')) {
            this.goToProjList();
          }
        });
      },
      onError: error2 => {
        console.log(error2);
      }
    });
  }

  createNewUser(inp) {
    console.log('modal clicked ', inp);
    this.neoConn.createUser(inp.login, inp.password).subscribe({
      onCompleted: summary => {
        console.log(summary);
        this.getUsers();
      },
      onError: error2 => {
        console.log(error2);
      }
    });
  }

  getUsers() {
    console.log('getting');
    this.usersArr = [];
    this.neoConn.getUsers().subscribe({
      onNext: record => {
        this.zone.run(() => {
          this.usersArr.push(record.get('user').properties.login);
        });
      },
      onCompleted: summary => {
        console.log(summary);
        if (this.usersArr && this.usersArr.length === 0) {
          // setTimeout(this.openModal.bind(this), 0);
          this.showCreatingUser = true;
          this.openModal();

        }
      },
      onError: error2 => {
        console.log(error2);
      }
    });
  }

  openModal() {
    document.getElementById('hiddenMdlButton').click();
  }

  openErrModal(err) {
    this.error = err;
    this.errorShowing = true;
  }

  closeErrModal() {
    this.errorShowing = false;
    this.error = '';
  }

  ngOnInit() {

    this.form = this._fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.getUsers();
  }

}

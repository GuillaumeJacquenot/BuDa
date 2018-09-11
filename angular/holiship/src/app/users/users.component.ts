import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { NeoConnectService } from '../../services/neo-connect.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  public form: FormGroup;
  usersArr: Array<any> = [];

  currUser: any;
  public editPassForm: FormGroup;

  constructor(private _fb: FormBuilder,
              public router: Router,
              public neoConn: NeoConnectService,
              private zone: NgZone) {
  }

  goToProjList() {
    this.router.navigate(['']);
  }

  createUser() {
    console.log(this.form.value.login);
    this.neoConn.createUser(this.form.value.login, this.form.value.password).subscribe({
      onCompleted: summary => {
        console.log(summary);
        this.getUsers();
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
    this.usersArr = [];
    this.neoConn.getUsers().subscribe({
      onNext: record => {
        this.zone.run(() => {
          this.usersArr.push(record.get('user').properties);
        });
      },
      onCompleted: summary => {
        console.log(summary);
      },
      onError: error2 => {
        console.log(error2);
      }
    });
  }

  changeUserStatus(login, currentStatus) {
    if (currentStatus) {
      this.neoConn.deactivateUser(login);
    } else {
      this.neoConn.activateUser(login);
    }
  }

  preChangePass(user) {
    this.currUser = user;
  }

  changePass(inp) {
    console.log('going to change pass', this.currUser, inp.password);

    this.neoConn.changeUserPassword(this.currUser.login, inp.password).subscribe({
      onNext: record => {
        console.log(record);
      },
      onCompleted: summary => {
        console.log(summary);
        this.getUsers();
      },
      onError: error2 => {
        console.log(error2);
      }
    });

    this.editPassForm.reset();
    this.currUser = '';
  }

  ngOnInit() {
    this.form = this._fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passwordCnf: ['', [Validators.required]]
    });

    this.editPassForm = this._fb.group({
      password: ['', [Validators.required]],
      passwordCnf: ['', [Validators.required]]
    });

    this.getUsers();
  }

}

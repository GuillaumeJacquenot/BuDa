import { Component, OnInit, NgZone } from '@angular/core';
import { NeoConnectService } from '../../services/neo-connect.service';
import { NotificationsService } from '../../services/notifications.service';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projArr: any[] = [];

  canCreateProj: boolean;

  currProj: any;

  loading = false;

  constructor(public neoConn: NeoConnectService,
              public notificationsService: NotificationsService,
              public router: Router,
              private route: ActivatedRoute,
              private zone: NgZone) {
  }

  getProjects() {
    this.loading = true;
    this.projArr = [];
    this.neoConn.getProjects().subscribe({
      onNext: record => {
        console.log('next proj => ', record);
        this.zone.run(() => {
          this.projArr.push(record.get('n'));
        });
      },
      onCompleted: compl => {
        console.log('ready => ', this.projArr);
        this.zone.run(() => {
          this.loading = false;
        });
      },
      onError: err => {
        this.zone.run(() => {
          this.loading = false;
        });
        console.log(err);
      }
    });
  }

  createProject(projName: string) {
    if (!projName) {return; }
    this.loading = true;
    projName = projName.replace(/\s/g, '_' );

    this.neoConn.createProject(projName).subscribe({
      onCompleted: summary => {
        this.getProjects();
      },
      onError: err => {
        this.zone.run(() => {
          this.loading = false;
        });
        console.log(err);
      }
    });
  }

  deleteProj(proj: any) {
    console.log('proj => ', proj);
    this.neoConn.deleteProjectByID(proj.identity).subscribe({
      onNext: record => {
        // console.log('next => ', record);
      },
      onCompleted: summary => {
        console.log('summary => ', summary);
        this.getProjects();
      },
      onError: error => {
        console.error('err => ', error);
      }
    });
  }

  preEditProj(proj: any) {
    console.log('proj => ', proj);
    this.currProj = proj;
  }

  editProj(proj: any, newName: string) {
    console.log('proj => ', proj, newName);
    this.neoConn.editProjectNamebyID(proj.identity, newName).subscribe({
      onNext: record => {
        console.log('edit proj next => ', record);
      },
      onCompleted: summary => {
        console.log('edit proj ready => ', summary);
        this.getProjects();
        this.currProj = {};
      },
      onError: error => {
        console.error('edit proj error => ', error);
      }
    });
  }

  goToUsers() {
    this.router.navigate([`users`]);
  }

  projInpOnChange($event, value) {
    // console.log('.', value);
    if(this.currProj) {
      this.canCreateProj = value != this.currProj.properties.name && !!value;
    } else {
      this.canCreateProj = !!value;
    }
  }

  ngOnInit() {
    this.getProjects();
  }

}

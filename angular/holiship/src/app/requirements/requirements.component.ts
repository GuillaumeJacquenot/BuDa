import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import * as Papa from 'papaparse/papaparse.js';

import { NeoConnectService } from '../../services/neo-connect.service';
import { NotificationsService } from '../../services/notifications.service';
import { ExternalMessagesService } from '../../services/external-messages.service';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.css']
})

export class RequirementsComponent implements OnInit {
  @ViewChild('appMenuParent') menuParent;
  @ViewChild('hiddenCreateReqRevisionTr') hiddenCreateReqRevisionTr;

  loading = false;

  routes: any[] = [];

  public infoShowing: boolean;
  public errorShowing: boolean;
  public creatingModalShowing: boolean;
  public versionModalShowing: boolean;
  public compareShowing: boolean;
  public canEditState: boolean;

  objectKeys = Object.keys;
  reqs: any[];
  error: String = 'future error';
  modalVer: any = {};
  newReqs: object = {};
  topReqs: object = {};
  currTopReq: any = {};
  userSubscribtions: any = [];

  curReq: {} = {};

  private sub: any;
  project: string;

  constructor(public neoConn: NeoConnectService,
              public router: Router,
              public route: ActivatedRoute,
              private _fb: FormBuilder,
              public notificationService: NotificationsService,
              public msgService: ExternalMessagesService,
              private zone: NgZone) {
    this.routes = [
      {
      name: 'Projects',
      route: ''
      },
      {
        name: this.project,
        route: `proj/${this.project}`
      }];
  }

  reqEdit(row) {
     console.log(row, 'editing');
     this.curReq = row;
     this.versionModalShowing = true;
  }

  createNew(req) {
    req.ver = 1;
    this.loading = true;

    req.title = this.inpReplace(req.title);

    this.neoConn.createReq(this.project, req).subscribe({
      onNext: record => {},
      onCompleted: res => {
        console.log(res);
        this.getReqirements();
        this.notificationService.createNotifications(`Requirement with ID: '${req.id}'
         created by ${localStorage.getItem('user')} in project '${this.project}'`, 'created', 'Requirement', req.id);
        this.changeSubscription(req.id);
      },
      onError: error => {
        console.log(error);
        this.loading = false;
        this.openErrModal(error);
      }
    });
  }

  checkUserSubscribtion(id: string): boolean {
    this.userSubscribtions = this.notificationService.getUserSubscriptions();
    if (this.userSubscribtions.find(obj => (obj.id === id && obj.type === 'requirement'))) {
      return true;
    }
    return false;
  }

  deleteVer(row) {
    this.loading = true;

    console.log('Deleting ver: ', row );

    this.neoConn.deleteReqVer(this.project, row).subscribe({
      onNext: record => {},
      onCompleted: res => {
        console.log(res);
        this.notificationService.createNotifications(`${row.id} version ${row.ver} was deleted ${localStorage.getItem('user')}`, 'deleted',
          'Requirement', row.id, this.project);
        this.getReqirements();
      },
      onError: error => {
        console.log(error);
        this.openErrModal(error);
        this.loading = false;
      }
    });
  }

  createReqVer(ver) {
    console.log(ver);
    this.loading = true;

    ver.currentVer.ver = 1 + Number(this.newReqs[ver.currentVer.id][0].ver);
    ver.title = this.inpReplace(ver.title);

     const req = {id: ver.currentVer.id, title: ver.title, descr: ver.desc, ver: ver.currentVer.ver};

     this.neoConn.createReqVer(this.project, req).subscribe({
       onNext: record => {},
       onCompleted: res => {
         console.log(res);
         this.notificationService.createNotifications(`${ver.currentVer.id} was updated by ${localStorage.getItem('user')}`, 'updated',
           'Requirement', ver.currentVer.id, this.project);
         this.userSubscribtions = this.notificationService.getUserSubscriptions();
         this.getReqirements();
       },
       onError: error => {
         console.log(error);
         this.openErrModal(error);
         this.loading = false;
       }
     });
   }

  getReqirements(clb?: any) {
    this.loading = true;
    this.newReqs = [];

    this.neoConn.getReqs(this.project).subscribe({
     onNext: record => {

       const id = record['_fields'][0].properties.id;
       const name = record['_fields'][1].properties.title;
       const recVer = record['_fields'][1].properties.ver;
       const writer = record['_fields'][2].properties.login;
       const ver = record['_fields'][1].properties;

       ver['id'] = id;
       ver['writer'] = writer;

       if (this.newReqs[id] instanceof Array) {
         this.newReqs[id].push(ver);

         if (recVer > this.topReqs[id].ver) {
           this.topReqs[id] = ver;
         }
       } else {
         this.newReqs[id] = [ver];
         this.topReqs[id] = ver;
       }
     },
     onCompleted: (res) => {
       this.zone.run(() => {
         this.loading = false;
       });

       console.log('completed', res, this.newReqs);
       if (clb) clb();
     },
     onError: error => {
       console.log(error);
       this.loading = false;
       this.openErrModal(error);
       if (clb) clb(error);
     }
   });
 }

  changeSubscription(id: string) {
    this.notificationService.changeSubscription('requirement', id);
 }

  openVerModal(ver) {
    console.log(ver);
    this.modalVer = ver;
    this.infoShowing = true;
  }

  closeModal() {
    this.infoShowing = false;
    this.modalVer = {};
  }

  deleteReq(reqId) {
    this.neoConn.deleteRequirement(this.project, reqId).subscribe({
      onCompleted: summary => {
        this.notificationService.createNotifications(`${reqId} was deleted by ${localStorage.getItem('user')}`, 'deleted',
          'Requirement', reqId, this.project);
        this.getReqirements();
      }
    });
  }

  openErrModal(err) {
    this.error = err;
    this.errorShowing = true;
  }

  closeErrModal() {
    this.errorShowing = false;
    this.error = '';
  }

  goToProject() {
    this.router.navigate([`proj/${this.project}`]);
  }

  objCompare(obj1, obj2) {
    // console.log('compare ', obj1, ' and ', obj2);
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  openCompareModal(req) {
    this.currTopReq = req;
    // this.
    this.compareShowing = true;
    console.log('compare ', req, 'topSces ', this.topReqs, 'arr ', this.newReqs);
    this.currTopReq = req;
  }

  closeCompareModal() {
    console.log('closing compare modal');
    this.compareShowing = false;
    this.currTopReq = {};
  }

  getCsv() {
    console.log(this.newReqs);

    const head = ['id', 'title', 'version', 'date', 'description', 'writer'];
    const rows = [];
    let csvContent = 'data:text/csv;charset=utf-8,' + head.join(',') + '\r\n';

    for (const key in this.newReqs) {
      this.newReqs[key].forEach( row => {
        const trow = `"${row.id}","${row.title}","${row.ver}","${row.date}","${row.desc}","${row.writer}"`;
        // rows.push(trow.split(','));
        csvContent += trow + '\r\n';
      } );
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'requirements.csv');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
  }

  fileChangeListener($event) {
    console.log($event);
    const files = $event.srcElement.files;
    console.log(files);
    Papa.parse(files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const regsIds = {};
        results.data.forEach( req => {
          if (regsIds[req.id]) {
            regsIds[req.id].push(req);
          } else { regsIds[req.id] = [req]; }
        } );
        console.log('parse res => ', results.data, regsIds);
        this.uploadCSVContent(regsIds);
      }
    });

  }

  uploadCSVContent(csvContent) {
    let reqBody = `match (proj:Project{name: "${this.project}"})
    match (usr:User{login:"${localStorage.getItem('user')}"}) `;
    const now = new Date().toISOString();
    for (const key in csvContent) {
      reqBody += `create (proj)-[:Contain]->(${key}:Requirement{id: "${key}"}) `;
      for (let i = 0; i < csvContent[key].length; i++) {
        reqBody += `create (${key})-[:Contain]->(:RequirementVer{ver:"${csvContent[key][i].version}", date: "${now}",
        desc: "${csvContent[key][i].description}", title:"${csvContent[key][i].title}"})
      -[:CREATED_BY]->(usr) `;
      }
    }
    this.neoConn.runExternalCode(reqBody).subscribe({
      onCompleted: summary => {
        this.getReqirements();
      },
      onError: error2 => {
        console.log(error2);
        alert(error2);
      }
    });
    console.log(reqBody);
  }

  inpEditOnChange($event, value) {
    this.canEditState = !!value;
  }

  preCreateRevision() {
    this.loading = true;
    this.getReqirements((err) => {
      if (err) return;

      console.log(this.topReqs);
      this.hiddenCreateReqRevisionTr.nativeElement.click();
    });
  }

  createRevision(value) {
    this.loading = true;

    let reqs = [];
    for (const i in this.topReqs) {
      console.log(this.topReqs[i]); // "4", "5", "6"
      reqs.push(this.topReqs[i]);
    }

    this.neoConn.createRevisionRequirements(this.project, value, reqs).subscribe({
      onNext: record => {
        console.log('req rev next => ', record);
      },
      onCompleted: summary => {
        console.log('req rev comp => ', summary);
        this.loading = false;
      },
      onError: error2 => {
        console.error(error2);
        this.loading = false;
      }
    });
  }

  inpReplace(inp: string) {
    return inp.replace(/(\s|\.|:|;)/g, '_') || '_';
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.project = params['id'];
      this.getReqirements();
      this.notificationService.setupCurrentProject(this.project);
      this.msgService.setupCurrentProject(this.project);
      this.routes = [
        {
          name: 'Projects',
          route: ''
        },
        {
          name: this.project,
          route: `proj/${this.project}`
        }];
      console.log(this.project, ' project');
    });
    this.userSubscribtions = this.notificationService.getUserSubscriptions();
  }

}

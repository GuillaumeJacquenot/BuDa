import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import * as Papa from 'papaparse/papaparse.js';

import { NeoConnectService } from '../../services/neo-connect.service';
import { NotificationsService } from '../../services/notifications.service';
import { ExternalMessagesService } from '../../services/external-messages.service';

@Component({
  selector: 'app-scenarios',
  templateUrl: './scenarios.component.html',
  styleUrls: ['./scenarios.component.css']
})
export class ScenariosComponent implements OnInit {
  @ViewChild('hiddenTr') errBtn: ElementRef;
  @ViewChild('hiddenTr1') infoBtn: ElementRef;
  @ViewChild('hiddenCreateSceRevisionTr') hiddenCreateSceRevisionTr: ElementRef;

  loading = false;

  public newScenario: FormGroup;

  error: String = 'future error';
  modalVer: any = {};

  public infoShowing: boolean;
  public errorShowing: boolean;
  public creatingModalShowing: boolean;
  public versionModalShowing: boolean;
  public compareShowing: boolean;
  public canEditState: boolean;

  routes: any[] = [];
  curSce: any = {};
  sceArr: object = {};
  topSce: object = {};
  currTopSce: any = {};
  userSubscribtions: any = [];

  objectKeys = Object.keys;

  private sub: any;
  project: string;

  constructor(public neoConn: NeoConnectService,
              public router: Router,
              private route: ActivatedRoute,
              private _fb: FormBuilder,
              public notificationsService: NotificationsService,
              public msgService: ExternalMessagesService,
              private zone: NgZone) {}

  reqEdit(row) {
    console.log(row, 'editing');
    this.curSce = row;
    this.versionModalShowing = true;
  }

  createNew(sce) {
    console.log('in scenario =>', sce);

    this.loading = true;
    this.creatingModalShowing = false;

    sce.title = this.inpReplace(sce.title);
    sce.ver = 1;
    console.log('creating', sce);
    this.neoConn.createSce(this.project, sce).subscribe({
      onNext: record => {},
      onCompleted: res => {
        console.log(res);
        this.notificationsService.createNotificationsAboutSce(`New scenario with ID: '${sce.id}' created by ${localStorage.getItem('user')}
         in project '${this.project}'`, 'created', 'Scenario', sce.id);
        this.changeSubscription(sce.id);
        this.getScenarios();
      },
      onError: error => {
        console.log(error);
        this.loading = false;
        this.openErrModal(error);
      }
    });
  }

  deleteVer(row) {
    this.loading = true;

    this.neoConn.deleteSceVer(this.project, row).subscribe(
      {
        onNext: record => {},
        onCompleted: res => {
          console.log(res);
          this.notificationsService.createNotificationsAboutSce(`${row.id} version ${row.ver} was deleted ${localStorage.getItem('user')}`,
            'deleted', 'Scenario', row.id, this.project);
          this.getScenarios();
        },
        onError: error => {
          console.log(error);
          this.loading = false;
          this.openErrModal(error);
        }
      }
    );
  }

  checkUserSubscribtion(id: string): boolean {
    this.userSubscribtions = this.notificationsService.getUserSubscriptions();
    if (this.userSubscribtions.find(obj => (obj.id === id && obj.type === 'scenario'))) {
      return true;
    }
    return false;
  }

  reqSave(sce) {
    this.loading = true;

    // sce.currentVer.ver = (+(this.sceArr[sce.currentVer.id].reduce((l, e) => {
    //   return (e.ver > l.ver ? e.ver : l.ver);
    // })) || +sce.currentVer.ver) + 1;

    sce.currentVer.ver = 1 + Number(this.sceArr[sce.currentVer.id][0].ver);
    sce.title = this.inpReplace(sce.title);

    const sceVer = {
      id: sce.currentVer.id,
      title: sce.title,
      descr: sce.desc,
      ver: sce.currentVer.ver
    };
    this.neoConn.createSceVer(this.project, sceVer).subscribe({
      onNext: record => {},
      onCompleted: res => {
        console.log(res);
        this.notificationsService.createNotificationsAboutSce(`${sce.currentVer.id} was updated by ${localStorage.getItem('user')}`,
          'updated', 'Scenario', sce.currentVer.id, this.project);
        this.getScenarios();
      },
      onError: error => {
        console.log(error);
        this.loading = false;
        this.openErrModal(error);
      }
    });
  }

  getScenarios(clb?: any) {
    this.loading = true;
    this.sceArr = [];

    this.neoConn.getScenarios(this.project).subscribe({
      onNext: record => {

        const id = record['_fields'][0].properties.id;
        const name = record['_fields'][1].properties.title;
        const sceVer = record['_fields'][1].properties.ver;
        const writer = record['_fields'][2].properties.login;
        const ver = record['_fields'][1].properties;

        ver['id'] = id;
        ver['writer'] = writer;

        if (this.sceArr[id] instanceof Array) {
          this.sceArr[id].push(ver);


          if (sceVer > this.topSce[id].ver) {
            this.topSce[id] = ver;
          }

        } else {
          this.sceArr[id] = [ver];
          this.topSce[id] = ver;
        }

        // console.log('next\n', '\n', this.reqs, record);
      },
      onCompleted: (res) => {
        // this.newReqs = Object.keys(this.newReqs).map((key) => {
        //   return {
        //     id: key,
        //     versions: this.newReqs[key]
        //   };
        // });
        this.zone.run(() => {
          this.loading = false;
        });
        console.log('completed', res, this.sceArr);
        if(clb) clb();
      },
      onError: error => {
        this.loading = false;
        console.log(error);
        this.openErrModal(error);
        if(clb) clb(error);
      }
    });
  }

  goToProject() {
    this.router.navigate([`proj/${this.project}`]);
  }

  deleteCse(sceId) {
    this.neoConn.deleteScenario(this.project, sceId).subscribe({
      onCompleted: summary => {
        this.notificationsService.createNotificationsAboutSce(`${sceId} was deleted by ${localStorage.getItem('user')}`, 'deleted',
          'Scenario', sceId, this.project);
        this.getScenarios();
      }
    });
  }

  changeSubscription(id: string) {
    this.notificationsService.changeSubscription('scenario', id);
  }

  openErrModal(err) {
    this.error = err;
    this.errorShowing = true;
  }

  closeErrModal() {
    this.errorShowing = false;
    this.error = '';
  }

  openVerModal(ver) {
    console.log(ver);
    this.modalVer = ver;
    this.infoShowing = true;
  }

  closeModal() {
    this.infoShowing = false;
    // this.modalVer = {};
  }

  objCompare(obj1, obj2) {
    // console.log('compare ', obj1, ' and ', obj2);
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  openCompareModal(sce) {
    this.currTopSce = sce;
    this.compareShowing = true;
    console.log('compare ', sce, 'topSces ', this.topSce, 'arr ', this.sceArr);
  }

  closeCompareModal() {
    console.log('closing compare modal');
    this.compareShowing = false;
    this.currTopSce = {};
  }

  getCsv() {
    console.log(this.sceArr);

    // console.log('papa ===> ', Papa.unparse(this.sceArr));

    const head = ['id', 'title', 'version', 'date', 'description', 'writer'];
    const rows = [];
    let csvContent = 'data:text/csv;charset=utf-8,' + head.join(',') + '\r\n';

    for (const key in this.sceArr) {
      this.sceArr[key].forEach( row => {
        const trow = `"${row.id}","${row.title}","${row.ver}","${row.date}","${row.desc}","${row.writer}"`;
        // rows.push(trow.split(','));
        csvContent += trow + '\r\n';
      } );
    }

    // rows.forEach(function(rowArray){
    //   const row = rowArray.join(',');
    //   csvContent += row + '\r\n';
    // });

    console.log(rows, csvContent);

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scenarios.csv');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
  }

  fileChangeListener($event) {
    console.log($event);
    let files = $event.srcElement.files;
    console.log(files);
    Papa.parse(files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let sceIds = {};
        results.data.forEach( req => {
          if (sceIds[req.id]) {
            sceIds[req.id].push(req);
          } else { sceIds[req.id] = [req]; }
        } );
        console.log('parse res => ', results.data, sceIds);
        this.uploadCSVContent(sceIds);
      }
    });

  }

  uploadCSVContent(csvContent) {
    let reqBody = `match (proj:Project{name: "${this.project}"})
    match (usr:User{login:"${localStorage.getItem('user')}"}) `;
    const now = new Date().toISOString();
    for (const key in csvContent) {
      reqBody += `create (proj)-[:Contain]->(${key}:Scenario{id: "${key}"}) `;
      for (let i = 0; i < csvContent[key].length; i++) {
        reqBody += `create (${key})-[:Contain]->(:ScenarioVer{ver:"${csvContent[key][i].version}", date: "${now}",
        desc: "${csvContent[key][i].description}", title:"${csvContent[key][i].title}"})
      -[:CREATED_BY]->(usr) `;
      }
    }
    this.neoConn.runExternalCode(reqBody).subscribe({
      onCompleted: summary => {
        this.getScenarios();
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
    this.getScenarios((err) => {
      if (err) return;

      console.log(this.topSce);
      this.hiddenCreateSceRevisionTr.nativeElement.click();
    });
  }

  createRevision(value) {
    this.loading = true;

    let sces = [];
    for (const i in this.topSce) {
      console.log(this.topSce[i]); // "4", "5", "6"
      sces.push(this.topSce[i]);
    }

    this.neoConn.createRevisionScenario(this.project, value, sces).subscribe({
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
    console.log('papa ', Papa);
    this.sub = this.route.params.subscribe(params => {
      this.project = params['id'];
      this.getScenarios();
      this.notificationsService.setupCurrentProject(this.project);
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

    this.newScenario = this._fb.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

}

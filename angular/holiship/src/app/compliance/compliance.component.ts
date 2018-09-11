import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { NeoConnectService } from '../../services/neo-connect.service';
import * as Papa from 'papaparse/papaparse.js';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css']
})
export class ComplianceComponent implements OnInit {
  @ViewChild('csvBtn') csvBtn: ElementRef;

  routes: any[] = [];
  project: string;
  private sub: any;

  public errorShowing: boolean;
  error: string;

  reqs: any[] = [];
  topReqs: object = {};

  sces: any[] = [];
  topSce: object = {};

  compliances: any[] = [];

  loading = false;

  objectKeys = Object.keys;

  constructor(public router: Router,
              private route: ActivatedRoute,
              public neoConn: NeoConnectService,
              public notificationsService: NotificationsService) { }

  goToProject() {
    this.router.navigate([`proj/${this.project}`]);
  }

  getReqirements(clb?: any) {
    this.loading = true;
    this.reqs = [];

    this.neoConn.getReqs(this.project).subscribe({
      onNext: record => {

        const id = record['_fields'][0].properties.id;
        const name = record['_fields'][1].properties.title;
        const recVer = record['_fields'][1].properties.ver;
        const writer = record['_fields'][2].properties.login;
        const ver = record['_fields'][1].properties;

        ver['id'] = id;
        ver['writer'] = writer;

        if (this.reqs[id] instanceof Array) {
          this.reqs[id].push(ver);

          if (recVer > this.topReqs[id].ver) {
            this.topReqs[id] = ver;
          }
        } else {
          this.reqs[id] = [ver];
          this.topReqs[id] = ver;
        }
      },
      onCompleted: (res) => {
        // this.zone.run(() => {
        //   this.loading = false;
        // });

        this.loading = false;

        console.log('completed reqs', res, this.reqs, this.topReqs);
        if (clb) clb();
      },
      onError: error => {
        console.log(error);
        this.loading = false;
        // this.openErrModal(error);
        if (clb) clb(error);
      }
    });
  }

  getScenarios(clb?: any) {
    this.loading = true;
    this.sces = [];

    this.neoConn.getScenarios(this.project).subscribe({
      onNext: record => {

        const id = record['_fields'][0].properties.id;
        const name = record['_fields'][1].properties.title;
        const sceVer = record['_fields'][1].properties.ver;
        const writer = record['_fields'][2].properties.login;
        const ver = record['_fields'][1].properties;

        ver['id'] = id;
        ver['writer'] = writer;

        if (this.sces[id] instanceof Array) {
          this.sces[id].push(ver);


          if (sceVer > this.topSce[id].ver) {
            this.topSce[id] = ver;
          }

        } else {
          this.sces[id] = [ver];
          this.topSce[id] = ver;
        }

        // console.log('next\n', '\n', this.reqs, record);
      },
      onCompleted: (res) => {
        // this.zone.run(() => {
        //   this.loading = false;
        // });
        this.loading = false;
        console.log('completed sce', res, this.sces, this.topSce);

        if (clb) clb();
      },
      onError: error => {
        this.loading = false;
        console.log(error);
        // this.openErrModal(error);
        if (clb) clb(error);
      }
    });
  }

  fileChangeListener($event) {
    this.csvBtn.nativeElement.click();
    const files = $event.srcElement.files;
    // console.log($event, files);
    Papa.parse(files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let reqId = '';
        let reqT = '';
        let sceId = '';
        let sceT = '';
        let compl = '';
        let comm = '';

        const res = [];
        let reqs = {};
        let sces = {};

        results.data.forEach( req => {
          reqId = req['Requirement ID'].trim() ? this.inpReplace(req['Requirement ID']) : reqId;
          reqT = req['Requirement Title'].trim() ? this.inpReplace(req['Requirement Title']) : reqT;
          sceId = this.inpReplace(req['Scenario ID']);
          sceT = this.inpReplace(req['Scenario Title']);
          compl = req['Compliance %'].trim() == 'n/a' ? '' : req['Compliance %'].trim();
          const cTmp = compl.split('');
          if (cTmp[cTmp.length-1] == '%') cTmp.pop();
          compl = cTmp.join('');
          comm = req['Comments'] == 'n/a' ? '' : req['Comments'];
          res.push({
            reqID: reqId,
            reqTitle: reqT,
            sceID: sceId,
            sceTitle: sceT,
            compliance: +compl,
            comments: comm
          });
          reqs[reqId] = {
            reqID: reqId,
            reqTitle: reqT
          };
          sces[sceId] = {
            sceID: sceId,
            sceTitle: sceT
          };
        });

        reqs = Object.keys(reqs).map(item => reqs[item]);
        sces = Object.keys(sces).map(item => sces[item]);

        this.getReqirements(() => {
          let f;
          console.log('reqs => ', this.topReqs, this.reqs);
          const reqKeys = Object.keys(this.topReqs);

          for (let i = 0; i < reqKeys.length; i++) {
            f = res.find(comp => {
              return comp.reqID == reqKeys[i];
            });
            console.log('found => ', f);
            if (f) {
              this.error = `Requirement with id "${f.reqID}" already exist in database. Please, remove that requirement from CSV-file or from your project and try again!`;
              console.error(this.error);
              alert(this.error);
              this.openErrModal(this.error);
              this.loadCompliance();
              break;
            }
          }

          if (!f) {
            this.getScenarios(() => {
              const sceKeys = Object.keys(this.topSce);

              for (let i = 0; i < sceKeys.length; i++) {
                f = res.find(comp => {
                  return comp.sceID == sceKeys[i];
                });
                console.log('found => ', f);
                if (f) {
                  this.error = `Scenario with id "${f.sceID}" already exist in database. Please, remove that scenario from CSV-file or from your project and try again!`;
                  console.error(this.error);
                  alert(this.error);
                  this.openErrModal(this.error);
                  break;
                }
              }
              this.uploadCSVData(reqs, sces, res);
            });
          }
        });
        console.log('parse res => ', results.data, res, reqs, sces);
        // this.uploadCSVContent(regsIds);
      }
    });
  }

  uploadCSVData(reqs, sces, compiliance) {
    const now = new Date().toISOString();
    let request = `match (proj:Project{name: "${this.project}"})
     match (usr:User{login:"${localStorage.getItem('user')}"}) `;
    for (let i = 0; i < reqs.length; i++) {
      request += `\ncreate (proj)-[:Contain]->(${reqs[i].reqID}:Requirement{id: "${reqs[i].reqID}"})-[:Contain]->(:RequirementVer{ver: "1", date: "${now}", desc: " ", title: "${reqs[i].reqTitle}"})-[:CREATED_BY]->(usr) `;
    }
    for (let i = 0; i < sces.length; i++) {
      request += `\ncreate (proj)-[:Contain]->(${sces[i].sceID}:Scenario{id: "${sces[i].sceID}"})-[:Contain]->(:ScenarioVer{ver: "1", date: "${now}", desc: " ", title: "${sces[i].sceTitle}"})-[:CREATED_BY]->(usr) `;
    }
    for (let i = 0; i < compiliance.length; i++) {
      request += `\ncreate (${compiliance[i].sceID})-[:Relates{complianceComment: "${compiliance[i].comments || 'n/d'}", compliancePercent: ${compiliance[i].compliance}}]->(${compiliance[i].reqID}) `;
    }
    console.log(request);
    this.neoConn.runExternalCode(request).subscribe({
      onCompleted: summary => {
        this.loadCompliance();
      },
      onError: error2 => {
        console.log(error2);
      }
    });
  }

  preSaveCompliances() {
    this.compliances = [];

    console.log('pre ==> ', this.topReqs);

    for (const req in this.topReqs) {
      console.log(req, this.topReqs[req]);
      this.topReqs[req].scenarios.forEach((it, i) => {
        console.log(it, i, this.topSce[it]);

        const n = (<HTMLInputElement>document.getElementById(`n${this.topSce[it].id}${this.topReqs[req].id}`)).value;
        const t = (<HTMLInputElement>document.getElementById(`t${this.topSce[it].id}${this.topReqs[req].id}`)).value;

        this.compliances.push({
          reqID: req,
          reqTitle: this.topReqs[req].title,
          sceID: this.topSce[it].id,
          sceTitle: this.topSce[it].title,
          compliance: Number(n),
          comments: t
        });
      });
    }

    console.log('compliances => ', this.compliances);
    this.saveCompiliance(this.compliances);
  }

  saveCompiliance(compiliance) {
    let request = `match (proj:Project{name: "${this.project}"})`;
    let doOfReq = ` `;
    for (let i = 0; i < compiliance.length; i++) {
      request += `\nmatch (proj)-[:Contain]->(:Scenario{id: "${compiliance[i].sceID}"})-[${'rel' + i}:Relates]->(:Requirement{id: "${compiliance[i].reqID}"})<-[:Contain]-(proj) `
      doOfReq += ` set ${'rel' + i}.compliancePercent = ${compiliance[i].compliance} set ${'rel' + i}.complianceComment = "${compiliance[i].comments}" `;
    }
    request += doOfReq + `return proj`;
    console.log(request);
    this.neoConn.runExternalCode(request).subscribe({
      onNext: next => {

      },
      onCompleted: summary => {
        this.loadCompliance();
      },
      onError: error2 => {
        console.log(error2);
      }
    });
  }

  getCsv() {
    console.log(this.topReqs, this.topSce);

    const head = ['Requirement ID', 'Requirement Title' , 'Scenario ID', 'Scenario Title', 'Compliance %', 'Comments'];
    const rows = [];
    let csvContent = 'data:text/csv;charset=utf-8,' + head.join(',') + '\r\n';

    for (const req in this.topReqs) {
      console.log(req, this.topReqs[req]);
      this.topReqs[req].scenarios.forEach((it, i) => {
        console.log(it, i, this.topSce[it]);
        const n = (<HTMLInputElement>document.getElementById(`n${this.topSce[it].id}${this.topReqs[req].id}`)).value;
        const t = (<HTMLInputElement>document.getElementById(`t${this.topSce[it].id}${this.topReqs[req].id}`)).value;
        const trow = `"${i === 0 ? req : ''}","${i === 0 ? this.topReqs[req].title : ''}","${it}","${this.topSce[it].title}","${n ? n + '%' : 'n/a'}","${t ? t : 'n/a'}"`;
        rows.push(trow);
        csvContent += trow + '\r\n';
      });
    }

    console.log(rows);

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Compliance.csv');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
  }

  openErrModal(err) {
    this.error = err;
    this.errorShowing = true;
    // document.getElementById('hiddenErrTr').click();
  }

  closeErrModal() {
    this.errorShowing = false;
    this.error = '';
  }

  loadCompliance() {
    this.getScenarios(() => {
      this.getReqirements(() => {
        for (const req in this.topReqs) {
          this.loading = true;
          this.topReqs[req].scenarios = [];
          // console.log('req => ', req, this.topReqs[req]);

          this.neoConn.getRelatedScenarios(this.project, req).subscribe({
            onNext: record => {
              this.topReqs[req].scenarios.push(record.get('sce').properties.id);
              // console.log('req record ', record.get('sce'));
            },
            onCompleted: summary => {
              // console.log('!!!reqs', this.topReqs);
              this.loading = false;
            },
            onError: err => {
              console.log(err);
              this.loading = false;
            }
          });
        }

        for (const sce in this.topSce) {
          this.loading = true;
          this.topSce[sce].requirements = {};
          console.log(sce, this.topSce[sce]);

          this.neoConn.getScenarioReqs(this.project, sce).subscribe({
            onNext: record => {
              const reqId = record.get('req').properties.id;
              const comm = record.get('rel').properties.complianceComment;
              const pers = record.get('rel').properties.compliancePercent;

              // this.topSce[sce].requirements.push({
              //   reqId: reqId,
              //   comment: comm,
              //   persents: pers
              // });

              this.topSce[sce].requirements[reqId] = {
                  reqId: reqId,
                  comment: comm,
                  persents: pers
              };
              console.log('sce record ', record.get('rel'));
              // this.currentSce.requirements.push(record.get('req'));
            },
            onCompleted: summary => {
              // this.zone.run(() => {});
              console.log('sces', this.topSce);

              // this.loading = !isReqs && !isBlcs;
              this.loading = false;
            },
            onError: err => {
              console.log(err);
              this.loading = false;
            }
          });
        }
      });
    });
  }

  inpReplace(inp: string) {
    return inp.trim().replace(/(\s|\.|:|;)/g, '_') || '_';
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.project = params['id'];
      this.notificationsService.setupCurrentProject(this.project);
      this.loadCompliance();
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
  }

}

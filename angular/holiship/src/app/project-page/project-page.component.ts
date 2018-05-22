import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, NgZone } from '@angular/core';
import { NeoConnectService } from '../../services/neo-connect.service';
import { NotificationsService } from '../../services/notifications.service';
import { ExternalMessagesService } from '../../services/external-messages.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {
  private sub: any;

  routes: any[] = [];

  loading = false;

  modalVer: any = {};
  userSubscribtions: any = [];

  public canEditBlck: boolean;

  public infoShowing: boolean;

  public editShowing: boolean;
  public editType: string;

  public blockShowing: boolean;
  public currBlock: any;

  currentSce: any = {
    id: '',
    requirements: [],
    blocks: []
  };
  project: string;

  requirements: any[] = [];

  reqsObj: object = {
    data: []
  };
  newReqs: object = {};
  topReqs: object = {};

  sceArr: object = {};
  topSce: object = {};

  blocks: any[] = [];
  scenarios: any[] = [];

  blocksObj: any = {};
  blocksIds: any = {};

  msgSubscr: Subscription;

  constructor(private route: ActivatedRoute,
              private neoConn: NeoConnectService,
              public router: Router,
              public notificationsService: NotificationsService,
              public msgService: ExternalMessagesService,
              private zone: NgZone) {
    this.routes = [{
      name: 'Projects',
      route: ''
    }];

    this.msgSubscr = this.msgService.subjectUpdate().subscribe(msg => {
      console.log('msg => ', msg);
      this.getProjectComponents();
    });

  }

  sortChecks() {
    console.log(this.requirements);
    this.requirements.sort((a, b) => {
      if (this.currentSce.requirements.indexOf(a.id) === this.currentSce.requirements.indexOf(b.id)) return 0;
      if (this.currentSce.requirements.indexOf(a.id) > -1) {
        return -1;
      }
      return 1;
    });
    // console.log(this.requirements);

    this.blocks.sort((a, b) => {
      if (this.currentSce.blocks.indexOf(a) === this.currentSce.blocks.indexOf(b)) return 0;
      if (this.currentSce.blocks.indexOf(a) > -1) return -1;
      return 1;
    });

    this.zone.run(() => {});
  }

  selectSce(sce) {
    let isReqs = false;
    let isBlcs = false;
    this.loading = true;

    this.currentSce.id = sce.id;
    this.currentSce.requirements = [];
    this.currentSce.blocks = [];
    this.neoConn.getScenarioReqs(this.project, this.currentSce.id).subscribe({
      onNext: record => {
        this.currentSce.requirements.push(record.get('req').properties.id);
        console.log('record ', record.get('req'));
        // this.currentSce.requirements.push(record.get('req'));
      },
      onCompleted: summary => {
        this.sortChecks();
        this.zone.run(() => {});
        console.log('reqs', this.requirements);

        isReqs = true;
        this.loading = !isReqs && !isBlcs;
      },
      onError: err => {
        console.log(err);
        this.loading = false;
      }
    });
    this.neoConn.getScenarioBlocks(this.project, this.currentSce.id).subscribe({
      onNext: record => {
        this.currentSce.blocks.push(record.get('blck').identity['low']);
      },
      onCompleted: summary => {
        this.sortChecks();
        this.zone.run(() => {});

        isBlcs = true;
        this.loading = !isReqs && !isBlcs;
      },
      onError: err => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  checkUserSubscribtion(id: string, type: string): boolean {
    this.userSubscribtions = this.notificationsService.getUserSubscriptions();
    if (this.userSubscribtions.find(obj => (obj.id === id && obj.type === type))) {
      return true;
    }
    return false;
  }

  newCheckUserSubscribtion(identity: any): boolean {
    this.userSubscribtions = this.notificationsService.getUserSubscriptions();
    // console.log(this.userSubscribtions);
    if (this.userSubscribtions.find(obj => {
        // console.log(obj, identity);
        return obj.identity.low === identity.low && obj.type === 'block';
      })) {
      return true;
    }
    return false;
  }

  getProjectComponents(clb?: any) {
    this.loading = true;
    this.scenarios = [];
    this.blocks = [];
    this.requirements = [];
    this.blocksObj = {
      data: []
    };
    this.neoConn.getReqs(this.project).subscribe({
      onNext: res => {
        console.log('req ', res);

        const id = res['_fields'][0].properties.id;
        const name = res['_fields'][1].properties.title;
        const recVer = res['_fields'][1].properties.ver;

        const ver = res['_fields'][1].properties;

        ver['id'] = id;

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
      onCompleted: compl => {
        console.log('req res!!! ===> ', this.requirements, this.newReqs);

        this.zone.run(() => {
          this.requirements = Object.keys(this.topReqs).map(key => {
            return {
              id: key,
              title: this.topReqs[key].title,
              data: {
                id: key,
                title: this.topReqs[key].title
              },
              'styleClass': 'p-center',
            };
          });

          this.reqsObj['data'] = this.requirements;
          console.log('req res!!!! ===> ', this.requirements, this.newReqs, this.reqsObj);

          this.loading = false;
          // console.log(tmp);
        });
      },
      onError: err => {
        console.log(err);
      }
    });

    this.neoConn.getScenarios(this.project).subscribe({
      onNext: res => {

        const id = res['_fields'][0].properties.id;
        const name = res['_fields'][1].properties.title;
        const sceVer = res['_fields'][1].properties.ver;

        const ver = res['_fields'][1].properties;

        ver['id'] = id;

        if (this.sceArr[id] instanceof Array) {
          this.sceArr[id].push(ver);


          if (sceVer > this.topSce[id].ver) {
            this.topSce[id] = ver;
          }

        } else {
          this.sceArr[id] = [ver];
          this.topSce[id] = ver;
        }

        this.scenarios.push({
          id: res.get('scenario').properties.id,
          title: res.get('scever').properties.title,
          ver: res.get('scever').properties.ver
        });
      },
      onCompleted: compl => {
        console.log(this.scenarios);

        const tmp = [];
        for (let i = 0; i < this.scenarios.length; i++) {
          if (tmp[this.scenarios[i].id]) {
            if (tmp[this.scenarios[i].id.ver] > this.scenarios[i].ver) {
              tmp[this.scenarios[i].id] = {
                ver: this.scenarios[i].ver,
                title: this.scenarios[i].title
              };
            }
          } else {
            tmp[this.scenarios[i].id] = {
              ver: this.scenarios[i].ver,
              title: this.scenarios[i].title
            };
          }
        }

        this.zone.run(() => {
          this.scenarios = Object.keys(tmp).map(key => {
            return {
              id: key,
              title: tmp[key].title
            };
          });
          if (this.scenarios.length > 0) this.selectSce(this.scenarios[0]);
          console.log('scenarios ', this.scenarios, this.topSce);
          console.log(tmp);
        });
      },
      onError: err => {
        console.log(err);
      }
    });

    this.neoConn.getBlocksOfProject(this.project).subscribe({
      onNext: res => {
        console.log('new block => ', res.get('blck'));

        const nextBlock = res.get('blck').properties.name;
        const nextBlockID = res.get('blck').identity;
        const children = [];

        this.neoConn.getBlockChildrenByID(this.project, nextBlockID).subscribe({
        // this.neoConn.getBlockChildren(this.project, [nextBlock]).subscribe({
          onNext: record2 => {
            // record2.get('block').properties.name
            // console.log('next child record => ', record2);
            const tBlock = {
              'data': {
                'name': record2.get('block').properties.name,
                'identity': record2.get('block').identity
              },
              'type': 'block',
              'children': [],
              'styleClass': 'bordered',
              'parents': [nextBlock, record2.get('block').properties.name]
            };
            this.blocksIds[tBlock.data.identity.low] = tBlock;
            children.push(tBlock);
          },
          onCompleted: summary => {
            // console.log('children => ', children);
          },
          onError: error2 => {
            console.error(error2);
          }
        });

        const nBlock = {
          'data': {
            'name': nextBlock,
            'identity': res.get('blck').identity,
            'date': res.get('blck').properties.date
          },
          'type': 'block',
          'children': children,
          'styleClass': 'bordered',
          'parents': [nextBlock]
        };
        this.blocksIds[nBlock.data.identity.low] = nBlock;
        this.blocksObj.data.push(nBlock);

        this.blocks.push({
          'name': res.get('blck').properties.name,
          'identity': res.get('blck').identity,
          'date': res.get('blck').properties.date
        });
      },
      onCompleted: compl => {
        // this.zone.run(() => {});
        console.log('blocks ===> ', this.blocks, compl, this.reqsObj, this.blocksObj);
        if (clb) clb();

        this.blocksObj.data.forEach(it => {
          this.codeLoadNode(it);
          this.loadLinkedBlocks(it);
        });
      },
      onError: err => {
        console.log(err);
      }
    });
  }

  connectRequirementToScenario(reqId) {
    this.neoConn.connectRequirementToScenario(this.project, this.currentSce.id, reqId).subscribe({
      onCompleted: summary => {
        console.log(summary);
        this.notificationsService.createNotifications(`Requirement id: '${reqId}' was
         connected to scenario id: '${this.currentSce.id}' of '${this.project}' project by ${localStorage.getItem('user')}`, 'linked',
          'Scenario', this.currentSce.id, this.project);
        this.selectSce(this.currentSce);
      },
      onError: err => {
        console.log(err);
      }
    });
  }

  connectBlockToScenario(block) {
    this.neoConn.connectBlockToScenario(this.project, this.currentSce.id, block.identity).subscribe({
      onCompleted: summary => {
        console.log(summary);
        this.notificationsService.createNotifications(`Block: '${block.name}' was
         connected to scenario id: '${this.currentSce.id}' of '${this.project}' project by ${localStorage.getItem('user')}`, 'linked',
          'Scenario', this.currentSce.id, this.project);
        this.selectSce(this.currentSce);
      },
      onError: err => {
        console.log(err);
      }
    });
  }

  disconnectRequirementFromScenario(reqId) {
    this.neoConn.disconnectRequirementFromScenario(this.project, this.currentSce.id, reqId).subscribe({
      onCompleted: summary => {
        console.log(summary);
        this.notificationsService.createNotifications(`Requirement id: '${reqId}' was
         disconnected from scenario id: '${this.currentSce.id}' of '${this.project}' project by ${localStorage.getItem('user')}`,
          'unlinked', 'Scenario', this.currentSce.id, this.project);
        this.selectSce(this.currentSce);
      },
      onError: err => {
        console.log(err);
      }
    });
  }

  disconnectBlockFromScenario(block) {
    this.neoConn.disconnectBlockFromScenario(this.project, this.currentSce.id, block.identity).subscribe({
      onCompleted: summary => {
        console.log(summary);
        this.notificationsService.createNotifications(`Requirement id: '${block.name}' was
         disconnected from scenario id: '${this.currentSce.id}' of '${this.project}' project by ${localStorage.getItem('user')}`,
          'unlinked', 'Scenario', this.currentSce.id, this.project);
        this.selectSce(this.currentSce);
      },
      onError: err => {
        console.log(err);
      }
    });
  }

  goToProjList() {
    this.router.navigate(['']);
  }

  closeInfoModal() {
    this.infoShowing = false;
    this.modalVer = {};
  }

  closeEditModal(delType: boolean) {
    this.editShowing = false;
    this.modalVer = {};
    this.editType = delType ? '' : this.editType;
  }

  createVer(ver) {
    console.log('creating: ', this.editType, ver);

    this.zone.run(() => {
      if (this.editType === 'req') {
        this.createReqVer(ver);
      } else if (this.editType === 'sce') {
        this.createSceVer(ver);
      } else if (this.editType === 'blck') {
        this.blockEdit(ver);
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
        this.notificationsService.createNotifications(`${ver.currentVer.id} was updated by ${localStorage.getItem('user')}`, 'updated',
          'Requirement', ver.currentVer.id, this.project);
          this.getProjectComponents();
      },
      onError: error => {
        console.log(error);
        // this.openErrModal(error);
        this.loading = false;
      }
    });
  }

  createSceVer(sce) {
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
        this.getProjectComponents();
      },
      onError: error => {
        console.log(error);
        this.loading = false;
        // this.openErrModal(error);
      }
    });
  }

  reqEdit(req) {
    console.log('Edit req: ', req);
    this.closeEditModal(true);
    this.editType = 'req';
    this.modalVer = this.topReqs[req.id];
    this.editShowing = true;
  }

  reqInfo(req) {
    console.log('Info req: ', req);
    this.closeInfoModal();
    this.modalVer = this.topReqs[req.id];
    this.infoShowing = true;
  }

  sceEdit(sce) {
    console.log('Edit sce: ', sce);
    this.closeEditModal(true);
    this.editType = 'sce';
    this.modalVer = this.topSce[sce.id];
    this.editShowing = true;
  }

  sceInfo(sce) {
    console.log('Info sce: ', sce);
    this.closeInfoModal();
    this.modalVer = this.topSce[sce.id];
    this.infoShowing = true;
  }

  blockPreEdit(block) {
    console.log(this.currBlock);
    this.currBlock = '';
    this.currBlock = block;
    console.log(this.currBlock);
  }

  blckEditOnChange($event, value) {
    this.canEditBlck = !!value;
  }

  changeSubscription(id: string, nodeType: string) {
    this.notificationsService.changeSubscription(nodeType, id);
  }

  blockChangeSubscription(node: any) {
    // console.log('sub', this.userSubscribtions);
    console.log(node);
    this.notificationsService.changeSubscription('block', node.data.identity, () => {
      // console.log(node.data.identity, this.checkUserSubscribtion, this.checkUserSubscribtion(node.data.identity), !!node.parent, !this.checkUserSubscribtion(node.parent.data.identity));
      if (this.newCheckUserSubscribtion(node.data.identity) && node.parent && !this.newCheckUserSubscribtion(node.parent.data.identity)) {
        this.blockChangeSubscription(node.parent);
      }

      if (this.newCheckUserSubscribtion(node.data.identity) && node.linked) {
        console.log('in check');
        node.linked.forEach(linBl => {
          // console.log('in for', linBl, !this.checkUserSubscribtion(linBl));
          if (!this.newCheckUserSubscribtion(linBl)) {
            this.neoConn.getNodeById(linBl).subscribe({
              onNext: record => {
                console.log('next block by id', linBl, record);
                this.blockChangeSubscription(this.blocksIds[linBl.low]);
              },
              onCompleted: summary => {
                console.log('compl block by id', linBl, summary);
              },
              onError: error => {
                console.log('compl block by id', linBl, error);
              }
            });
            // this.changeSubscription()
          }
        });
      }
    });
  }

  loadLinkedBlocks(node: any) {
    if (!node) return;

    node.linked = [];

    this.neoConn.getLinkedBlocksByID(node.data.identity).subscribe({
      onNext: record => {
        node.linked.push(record.get('block').identity);
      },
      onCompleted: summary => {
        console.log('linked blocks received\n', node);
      },
      onError: error => {
        console.error(error);
      }
    });
  }

  blockEdit(block) {
    this.loading = true;
    block = this.inpReplace(block);
    // console.log(this.currBlock, block);
    // this.neoConn.editBlock(this.project, this.currBlock.identity, block).subscribe({
    //   onNext: record => {},
    //   onCompleted: res => {
    //     console.log(res);
    //     // this.notificationsService.createNotifications(`${ver.currentVer.id} was updated by ${localStorage.getItem('user')}`, 'updated',
    //     //   'Requirement', ver.currentVer.id, this.project);
    //     this.getProjectComponents();
    //   },
    //   onError: error => {
    //     console.log(error);
    //     // this.openErrModal(error);
    //     this.loading = false;
    //   }
    // });

    let tmp = {};
    console.log('curr block => ', this.currBlock);
    this.neoConn.getNodeById(this.currBlock.data.identity).subscribe({
      onNext: record => {
        console.log('next by id => ', record);
        tmp = record;
      },
      onCompleted: summary => {
        console.log('summary by id => ', summary);
        if (tmp) {
          this.neoConn.editBlock(this.project, this.currBlock.data.identity, block).subscribe({
            onNext: record => {},
            onCompleted: summary2 => {
              console.log('summary after edit => ', summary2);
              this.getProjectComponents(() => {
                this.loading = false;
              });
            },
            onError: error2 => {
              console.log(error2);
              this.loading = false;
            }
          });
        }
      },
      onError: error2 => {
        console.error(error2);
      }
    });
  }

  blockInfo(block) {
    console.log('Info block: ', block);
    this.currBlock = block;
    this.blockShowing = true;
  }

  closeBlockInfoModal() {
    this.blockShowing = false;
    this.currBlock = '';
  }

  getCsv() {
    console.log(this.scenarios, this.requirements, this.blocks);

    const rows = [['name1', 'city1', 'some other info'], ['name2', 'city2', 'more info']];
    let csvContent = 'data:text/csv;charset=utf-8,';
    rows.forEach(function(rowArray){
      const row = rowArray.join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my_data.csv');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
  }

  inpReplace(inp: string) {
    return inp.trim().replace(/(\s|\.|:|;)/g, '_') || '_';
  }

  loadNode(event) {
    console.log(event);
    if (event.node && event.node.children) {
      event.node.children.forEach((child) => {
        this.loading = true;
        const parents = child.parents ? child.parents.slice() : [];
        // parents.push(child.data.name);
        child.children = [];
        console.log('prepare for getting children => ', child, parents, child.parents);
        // this.neoConn.getBlockChildren(this.project, parents).subscribe({
        this.neoConn.getBlockChildrenByID(this.project, child.data.identity).subscribe({
          onNext: record => {
            const subParents = parents;
            subParents.push(record.get('block').properties.name);
            console.log('on next subChild => ', record);
            const tBlock = {
              'data': {
                'name': record.get('block').properties.name,
                'identity': record.get('block').identity,
                'date': record.get('block').properties.date
              },
              'type': 'block',
              'children': [],
              'styleClass': 'bordered',
              'parents': subParents
            };
            this.blocksIds[tBlock.data.identity.low] = tBlock;
            child.children.push(tBlock);
          },
          onCompleted: summary => {
            console.log('one child ready ', child, this.blocksObj);
            this.loading = false;
            for (const cn of child.children){
              this.codeLoadNode(cn);
              this.loadLinkedBlocks(cn);
            }
          },
          onError: error2 => {
            console.error(error2);
            this.loading = false;
          }
        });
      });
    }
  }

  codeLoadNode(node) {
    console.log('code node => ', node);
    node.children = [];
    this.loading = true;

    if (node) {
      this.neoConn.getBlockChildrenByID(this.project, node.data.identity).subscribe({
        onNext: record => {
          // console.log('codechild ', node, record);
          const tBlock = {
            'data': {
              'name': record.get('block').properties.name,
              'identity': record.get('block').identity,
              'date': record.get('block').properties.date
            },
            'type': 'block',
            'children': [],
            'styleClass': 'bordered'
          };
          this.blocksIds[tBlock.data.identity.low] = tBlock;
          node.children.push(tBlock);
        },
        onCompleted: summary => {
          // console.log('codecompl ', node, summary);
          if (node.children) {
            node.expanded = true;
            for (const cn of node.children){
              this.codeLoadNode(cn);
              this.loadLinkedBlocks(cn);
            }
          }
          this.loading = false;
        },
        onError: error => {
          console.error('codeeerror ', error);
          this.loading = false;
        }
      });
    }
  }

  getJSON(inp) {
    inp = inp.replace(/'/g, '"');
    console.log(inp);

    try {
      this.msgService.getMessage(JSON.parse(inp));
    } catch (err) {
      console.error(err);
    }
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.project = params['id'];
      this.getProjectComponents();
      this.notificationsService.setupCurrentProject(this.project);
      this.msgService.setupCurrentProject(this.project);
      this.userSubscribtions = this.notificationsService.getUserSubscriptions();
      // In a real app: dispatch action to load the details here.
    });
  }
}

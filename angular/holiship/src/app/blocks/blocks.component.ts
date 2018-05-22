import { Component, OnInit, NgZone, ElementRef,
  ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NeoConnectService } from '../../services/neo-connect.service';
import { NotificationsService } from '../../services/notifications.service';
import { ExternalMessagesService } from '../../services/external-messages.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.css']
})
export class BlocksComponent implements OnInit {
  @ViewChild('hiddenNewChildTr') hiddenNewChildTr: ElementRef;

  private sub: any;
  project: string;

  routes: any[] = [];
  loading = false;
  userSubscribtions: any = [];

  currBlock: any = {};
  currBlockParents: boolean;
  public blockShowing: boolean;
  public stateShowing: boolean;
  blocks: any[] = [];
  blocksObj: any = {};
  blocksIds: any = {};

  canCreateBlck: boolean;
  canEditBlck: boolean;

  toLoadJSON: boolean;
  resCounter: number;

  edgesArr: any[] = [];
  edgeCounter: number;

  msgSubscr: Subscription;

  constructor(public neoConn: NeoConnectService,
              public router: Router,
              private route: ActivatedRoute,
              public notificationsService: NotificationsService,
              public msgService: ExternalMessagesService,
              private zone: NgZone) {

    this.msgSubscr = this.msgService.subjectUpdate().subscribe(msg => {
      console.log('msg => ', msg);
      this.getBlocks(null);
    });
  }

  getBlocks(clb) {
    // this.loading = true;
    this.notificationsService.fetchUserSubscribtions();
    this.blocks = [];
    this.blocksObj = {
      data: []
    };
    this.neoConn.getBlocksOfProject(this.project).subscribe({
      onNext: record => {
        const nextBlock = record.get('blck').properties.name;
        const newBlock = record['_fields'][0];
        this.blocks.push(nextBlock);
        // console.log('next block => ', nextBlock, newBlock);

        const children = [];
        this.neoConn.getBlockChildren(this.project, [nextBlock]).subscribe({
          onNext: record2 => {
            // console.log('next child record => ', record2, record2.get('block').properties.name);
            const tBlock = {
              'data': {
                'name': record2.get('block').properties.name,
                'identity': record2.get('block').identity,
                'date': record2.get('block').properties.date
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
            this.fetchUserSubscribtions();
          },
          onError: error2 => {
            console.error(error2);
          }
        });
        const nBlock = {
          'data': {
            'name': nextBlock,
            'identity': record.get('blck').identity,
            'date': record.get('blck').properties.date
          },
          'type': 'block',
          'children': children,
          'styleClass': 'bordered',
          'parents': [nextBlock]
        };
        this.blocksIds[nBlock.data.identity.low] = nBlock;
        this.blocksObj.data.push(nBlock);
    },
      onCompleted: res => {
        this.blocks = this.blocks.slice();
        // this.zone.run(() => {
        //   this.loading = false;
        // });

        console.log('completed', res, this.blocks, this.blocksObj, clb);
        if (clb) clb(null, 'ok');

        this.blocksObj.data.forEach(it => {
          this.codeLoadNode(it);
          this.loadLinkedBlocks(it);
        });
      },
      onError: error => {
        this.loading = false;
        console.log(error);
        if (clb) clb(error);
        // this.errorWork(error);
      }
    });
  }

  checkUserSubscribtion(identity: any): boolean {
    this.userSubscribtions = this.notificationsService.getUserSubscriptions();
    // console.log(this.userSubscribtions);
    if (this.userSubscribtions.find(obj => {
      // console.log(obj.identity.low, identity);
      return obj.identity.low === identity.low && obj.type === 'block';
    })) {
      return true;
    }
    return false;
  }

  goToProject() {
    this.router.navigate([`proj/${this.project}`]);
  }

  goToModel(block) {
    this.router.navigate([`/proj/${this.project}/model/${block}`]);
  }

  changeSubscription(node: any) {
    console.log(this.blocksIds);
    // console.log('sub', this.userSubscribtions);
    console.log(node, 'sub changed');
    this.notificationsService.changeSubscription('block', node.data.identity, () => {
      // console.log(node.data.identity, this.checkUserSubscribtion, this.checkUserSubscribtion(node.data.identity), !!node.parent, !this.checkUserSubscribtion(node.parent.data.identity));
      if (this.checkUserSubscribtion(node.data.identity) && node.parent && !this.checkUserSubscribtion(node.parent.data.identity)) {
        this.changeSubscription(node.parent);
      }

      if (this.checkUserSubscribtion(node.data.identity) && node.linked) {
        console.log('in check');
        node.linked.forEach(linBl => {
          // console.log('in for', linBl, !this.checkUserSubscribtion(linBl));
          if (!this.checkUserSubscribtion(linBl)) {
            this.neoConn.getNodeById(linBl).subscribe({
              onNext: record => {
                console.log('next block by id', linBl, record);
                this.changeSubscription(this.blocksIds[linBl.low]);
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

  createNewBlock(name: string) {
    name = this.inpReplace(name);
    name = name.trim().split(' ').join('_');
    this.loading = true;

    this.getBlocks((err, res) => {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log('Creating block', this.blocks);
        if (this.blocks.indexOf(name) < 0) {
          this.neoConn.createBlock(this.project, {name: name, id: null}).subscribe({
            onNext: record => {
              console.log('next ', record);
            },
            onCompleted: summary => {
              console.log('block added ==> ', summary);
              // this.changeSubscription(name);
              this.notificationsService.createNotifications(`Block '${name}'
              created by ${localStorage.getItem('user')} in project '${this.project}'`, 'created', 'Block', name);
              // this.fetchUserSubscribtions();
              this.getBlocks(() => {
                // this.fetchUserSubscribtions();
              });
              this.loading = false;
            },
            onError: error2 => {
              console.error(error2);
            }
          });
        } else {
          console.log('This block already exists');
          this.loading = false;
        }
      }
      this.currBlock = '';
      this.currBlockParents = false;
    });
  }

  fetchUserSubscribtions() {
    this.userSubscribtions = [];
    this.neoConn.getUserNotificationSubscribtions(this.project).subscribe({
      onNext: record => {
        // console.log('sub rec => ', record);
        this.userSubscribtions.push({
          id: record.get('n').properties.id || record.get('n').properties.name,
          identity: record.get('n').identity,
          type: record.get('n').labels[0].toLowerCase()
        });
      },
      onCompleted: summary => {
        console.log('subs: ', this.userSubscribtions);
        // this.getBlocks(null);
      }
    });
  }

  blockPreEdit(block: any) {
    console.log(this.currBlock);
    this.currBlock = {};
    this.currBlock = block;
    console.log(this.currBlock);
  }

  blockEdit(newBlock: string) {
    this.loading = true;
    newBlock = this.inpReplace(newBlock);
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
          this.neoConn.editBlock(this.project, this.currBlock.data.identity, newBlock).subscribe({
            onNext: record => {},
            onCompleted: summary2 => {
              console.log('summary after edit => ', summary2);
              this.getBlocks(() => {
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

    // this.getBlocks((err, res) => {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   } else {
    //     if (this.blocks.indexOf(newBlock) < 0) {
    //       this.neoConn.editBlock(this.project, this.currBlock, newBlock).subscribe({
    //         onNext: res => {
    //           console.log('Block changed next', res);
    //         },
    //         onCompleted: res => {
    //           console.log('Block changed', res);
    //           // this.fetchUserSubscribtions();
    //           // this.notificationsService.fetchNotifications();
    //           this.notificationsService.fetchUserSubscribtions();
    //           this.getBlocks(() => {});
    //           this.loading = false;
    //           this.currBlock = '';
    //         },
    //         onError: err => {
    //           console.error(err);
    //           this.loading = false;
    //           this.currBlock = '';
    //         }
    //       });
    //     } else {
    //       console.log('This block already exists');
    //       this.loading = false;
    //     }
    //   }
    // });
  }

  deleteBlock(block) {
    console.log(this.project, block);
    this.neoConn.deleteBlockWithChildrenById(block.data.identity).subscribe({
        onNext: next => {
          console.log('del next => ', next);
        },
        onCompleted: res => {
          console.log('del res => ', res);
          this.getBlocks(() => {});
        },
        onError: err => {
          console.error(err);
        }
      });

    // this.neoConn.deleteBlock(this.project, block.data.identity).subscribe({
    //   onNext: res => {
    //
    //   },
    //   onCompleted: res => {
    //     this.getBlocks(() => {});
    //   },
    //   onError: err => {
    //     console.error(err);
    //   }
    // });
  }

  blckInpOnChange($event, value) {
    // console.log('.', value);
    this.canCreateBlck = !!value;
  }

  blckEditOnChange($event, value) {
    this.canEditBlck = !!value;
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

  stateInfo(block) {
    console.log('Info block: ', block);
    this.currBlock = block;
    this.stateShowing = true;
  }

  closeStateModal() {
    this.stateShowing = false;
    this.currBlock = {};
  }

  addBlockChild(childName: string, clb?: any ) {
    this.loading = true;
    childName = this.inpReplace(childName);
    console.log(childName, this.currBlock);
    // this.neoConn.createNewBlockChild(this.project, this.currBlockParents, {name: childName, id: null}).subscribe({
    this.neoConn.createNewBlockChildById(this.project, this.currBlock.identity, {name: childName, id: null}).subscribe({
      onNext: () => {},
      onCompleted: summary => {
        this.notificationsService.createNotifications(`Block '${childName}'
         created by ${localStorage.getItem('user')} in project '${this.project}'`, 'created', 'Block', childName);
        this.loading = false;
        this.getBlocks(null);
        if (clb) clb();
        this.currBlock = {};
        this.currBlockParents = false;
      },
      onError: error2 => {
        this.loading = false;
        console.error(error2);
        this.currBlock = {};
        this.currBlockParents = false;
      }
    });
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
            for (const cn of child.children){
              // this.codeLoadNode(cn);
              this.loadLinkedBlocks(cn);
            }
            this.loading = false;
          },
          onError: error2 => {
            console.error(error2);
            this.loading = false;
          }
        });
      });
    }
  }

  loadLinkedBlocks(node: any) {
    if (!node) return;

    node.linked = [];

    this.neoConn.getLinkedBlocksByID(node.data.identity).subscribe({
      onNext: record => {
        node.linked.push(record.get('block').identity);
      },
      onCompleted: summary => {
        // console.log('linked blocks received\n', node);
      },
      onError: error => {
        console.error(error);
      }
    });
  }

  codeLoadNode(node) {
    // console.log('code node => ', node);
    node.children = [];
    node.linked = [];
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
          console.error('codeError ', error);
          this.loading = false;
        }
      });
    }
  }

  preAddBlockChild(block) {
    console.log(block, block.parents);
    this.currBlockParents = true;
    this.currBlock = block.data;
    this.hiddenNewChildTr.nativeElement.click();
  }

  inpReplace(inp: string) {
    return inp.trim().replace(/(\s|\.|:|;)/g, '_') || '_';
  }

  fileChangeListener($event) {
    // console.log($event);
    const files = $event.srcElement.files;
    // console.log(files);
    // console.log(files[0], files[0].name);

    const file = files[0];
    const fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);

    const self = this;

    function receivedText(e) {
      self.toLoadJSON = false;
      self.loading = true;

      let lines;
      let newArr;
      let nodes = {};
      let nodesArr = [];
      self.edgesArr = [];
      let ids = {};
      let res = {};

      try {
        lines = e.target.result;
        newArr = JSON.parse(lines);
        nodes = {};
        nodesArr = newArr.nodes.slice();
        self.edgesArr = newArr.edges.slice();
        ids = {};
        res = {};
      } catch (error) {
        console.error(error);
        self.loading = false;
        return;
      }

      if (nodesArr.length === 0) {
        self.loading = false;
        return;
      }

      // console.log('input', newArr.nodes, nodesArr);

      while (nodesArr.length > 0) {
        // console.log('nodes lenght: ', nodesArr.length);
        for (let i = 0; i < nodesArr.length; i++) {
          self.loading = true;
          if (!nodesArr[i] || !nodesArr[i].data || !nodesArr[i].data.id || !nodesArr[i].data.name ) {
            console.log('there is no needed information in next node: ', nodesArr[i]);
            nodesArr.splice(i, 1);
            self.loading = false;
            break;
          } else if (!nodesArr[i].data.parent) {
            res[nodesArr[i].data.id] = nodesArr[i].data;
            ids[nodesArr[i].data.id] = res[nodesArr[i].data.id];
            nodesArr.splice(i, 1);
            // console.log('after deleting', nodesArr, ids, res);

            break;
          } else if (ids[nodesArr[i].data.parent]) {
            // console.log('------');
            // console.log(nodesArr[i].data.parent, ids[nodesArr[i].data.parent]);
            ids[nodesArr[i].data.id] = nodesArr[i].data;
            ids[nodesArr[i].data.parent].children = ids[nodesArr[i].data.parent].children ? ids[nodesArr[i].data.parent].children : {};
            ids[nodesArr[i].data.parent].children[nodesArr[i].data.id] = nodesArr[i].data;
            nodesArr.splice(i, 1);
            // console.log('------');

            break;
          }
        }
      }

      self.resCounter = Object.keys(ids).length;

      console.log('result ==> ', ids, nodesArr, res);

      self.getBlocks(() => {

        const names = Object.keys(res).map(it => res[it].name);
        let fName = '';
        const isDouble = self.blocksObj.data.some((it) => {
          // console.log('in some => ', it);
          return names.find(name => {
            if (name === it.data.name) {
              fName = name;
              return name;
            } else return false;
          });
        });

        console.log('doubled', names, isDouble, fName);
        if (isDouble) {
          console.log('doubled', names, isDouble, fName);
          const error = `Block with name "${fName}" already exist in database. Please, remove that block from JSON-file or from your project and try again!`;
          console.error(error);
          alert(error);
          self.loading = false;
          return;
        }

        for (const nodeKey in res) {
          // if (self.resCounter<=1) return;
          self.loading = true;

            // console.log('creating block!!!!!!! =>> ', res[nodeKey]);
            self.neoConn.createBlock(self.project, res[nodeKey]).subscribe({
              onNext: next => {
                // console.log('new next => ', next);
                res[nodeKey].neoId = next.get('nBlock').identity;
              },
              onCompleted: summary => {
                // console.log('new created => ', summary, res[nodeKey], !!res[nodeKey].children);
                self.createChildren(res[nodeKey]);

                // self.resCounter--;
                // if (self.resCounter <= 1) self.getBlocks(() => {});

                if (self.resCounter > 1) self.resCounter--;
                else self.getBlocks(() => {
                  self.loading = false;
                  self.edgeCounter = 0;
                  self.createEdge();
                });

                // self.loading = false;
              },
              onError: err => {
                console.error('new error => ', err);
              }
            });

        }
      });

      // let i = 0;

      console.log('edgesArr => ', this.edgesArr);

      // function createEdge() {
      //   console.log('creating edge => ', i);
      //   if (i === this.edgesArr.length) {
      //     console.log('edges empty ', i);
      //     return;
      //   }
      //   self.msgService.createEdge(this.edgesArr[i++], () => {
      //     createEdge();
      //   });
      // }

      // edgesArr.forEach(edge => {
      //   console.log('edge => ', edge);
      //   self.msgService.createEdge(edge);
      // });
    }
  }

  createEdge() {
    console.log('creating edge => ', this.edgeCounter, this.edgesArr);
    if (this.edgeCounter === this.edgesArr.length) {
      console.log('edges empty ', this.edgeCounter);
      return;
    }

    this.msgService.createEdge(this.edgesArr[this.edgeCounter++], () => {
      this.createEdge();
    });
  }

  createChildren(block) {
    if (!block.children) {
      return;
    }

    for (const nodeKey in block.children) {
      // if (this.resCounter<=1) return;
      this.loading = true;
      // console.log(block.children[nodeKey]);
      this.neoConn.createNewBlockChildById(this.project, block.neoId, block.children[nodeKey]).subscribe({
        onNext: next => {
          console.log('InNew next => ', next, block.children[nodeKey]);
          block.children[nodeKey].neoId = next.get('nBlock').identity;
        },
        onCompleted: summary => {
          console.log('new created child => ', summary, block.children[nodeKey]);

          this.notificationsService.createNotifications(`Block '${block.children[nodeKey].name}'
          created by ${localStorage.getItem('user')} in project '${this.project}'`, 'created', 'Block', block.children[nodeKey].name);
          // this.fetchUserSubscribtions();

          this.createChildren(block.children[nodeKey]);

          if (this.resCounter > 1) this.resCounter--;
          else this.getBlocks(() => {
            this.loading = false;
            this.edgeCounter = 0;
            this.createEdge();
          });

          // this.loading = false;
          //
          // this.resCounter--;
          // if (this.resCounter <= 1) this.getBlocks(() => {});
        },
        onError: err => {
          console.error('new error => ', err);
        }
      });
    }
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.project = params['id'];
      this.notificationsService.setupCurrentProject(this.project);
      this.msgService.setupCurrentProject(this.project);
      // this.fetchUserSubscribtions();
      this.getBlocks(null);
      this.routes = [
        {
          name: 'Projects',
          route: ''
        },
        {
          name: this.project,
          route: `proj/${this.project}`
        }];
    });
  }

}

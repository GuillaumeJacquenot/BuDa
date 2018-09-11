import { Injectable, NgZone } from '@angular/core';
import { NeoConnectService } from './neo-connect.service';
import 'rxjs/add/observable/interval';


@Injectable()
export class NotificationsService {
  currentProject = '';
  notifications: Array<any> = [];
  remoteNotifications: Array<any> = [];
  userSubscribtions: Array<any> = [];

  constructor(public neoConnect: NeoConnectService, private zone: NgZone) {
    //this.fetchUserSubscribtions();
    // this.sub = Observable.interval(1500)
    //   .subscribe((val) => {
    //   this.fetchNotifications();
    // });
  }

  setupCurrentProject(projectName) {
    this.currentProject = projectName;
    this.fetchUserSubscribtions();
  }

  fetchUserSubscribtions(clb?: any) {
    this.userSubscribtions = [];
    this.neoConnect.getUserNotificationSubscribtions(this.currentProject).subscribe({
      onNext: record => {
        this.userSubscribtions.push({
          id: record.get('n').properties.id || record.get('n').properties.name,
          type: record.get('n').labels[0].toLowerCase(),
          identity: record.get('n').identity
        });
      },
      onCompleted: summary => {
        console.log('subs: ', this.userSubscribtions);
        if(clb) clb();
        this.fetchNotifications();
      }
    });
  }

  changeSubscription(nodeType: string, nodeId: any, clb?: any) {
    if (nodeType === 'block') {
      if (this.userSubscribtions.find(obj => (obj.identity.low === nodeId.low && obj.type === nodeType))) {
        this.neoConnect.unsubscribeBlockFromNotifications(nodeId).subscribe({
          onCompleted: summary => {
            this.fetchUserSubscribtions(clb);
            // if(clb) clb();
          }
        });
      } else {
        this.neoConnect.subscribeBlockToNotifications(nodeId).subscribe({
          onCompleted: summary => {
            this.fetchUserSubscribtions(clb);
            // if(clb) clb();
          }
        });
      }
    } else {
      if (this.userSubscribtions.find(obj => (obj.id === nodeId && obj.type === nodeType))) {
        this.neoConnect.unsubscribeFromNotifications(this.currentProject, nodeType, nodeId).subscribe({
          onCompleted: summary => {
            this.fetchUserSubscribtions(clb);
            // if(clb) clb();
          }
        });
      } else {
        this.neoConnect.subscribeToNotifications(this.currentProject, nodeType, nodeId).subscribe({
          onCompleted: summary => {
            this.fetchUserSubscribtions(clb);
            // if(clb) clb();
          }
        });
      }
    }
  }

  fetchNotifications() {
    this.zone.run(() => {
      // this.remoteNotifications = [];
      const previousNotificationsCount = this.remoteNotifications.length;
      this.neoConnect.getNotifications(this.currentProject).subscribe({
        onNext: record => {
          this.zone.run(() => {
            if (this.userSubscribtions.find(obj => (
                obj.id === record.get('n').properties.itemId && obj.type === record.get('n').properties.itemType.toLowerCase()
              ))) {
              this.remoteNotifications.push(record.get('n').properties);
            }
          });
        },
        onCompleted: summary => {
          this.remoteNotifications.splice(0, previousNotificationsCount);
        },
        onError: error2 => {
          console.log(error2);
        }
      });
    });
  }

  getNotifications() {
    return this.remoteNotifications;
  }

  getUserSubscriptions() {
    return this.userSubscribtions;
  }

  createNotifications(text: string, type: string, nodeType?: string, nameId?: string, projectName?: string) {
    this.notifications.push({
      type: type,
      nodeType: nodeType || '',
      text: text
    });
    this.neoConnect.createNotification(this.currentProject, nodeType, nameId, type, text).subscribe({
      onCompleted: summary => {
      },
      onError: error2 => {
        console.log(error2);
      }
    });
    const relatedScenarios = [];
    const relatedBlocks = [];
    if (projectName) {
      this.neoConnect.getRelatedScenarios(projectName, nameId).subscribe({
        onNext: record => {
          if (relatedScenarios.indexOf(record.get('sce').properties.id) === -1) {
            relatedScenarios.push(record.get('sce').properties.id);
            this.neoConnect.createNotification(this.currentProject, 'Scenario', record.get('sce').properties.id,
              'impacted', record.get('sce').properties.id + ' was impacted', ).subscribe({
              onCompleted: summary => {
              },
              onError: error2 => {
                console.log(error2);
              }
            });
          }
          console.log(relatedScenarios);
        },
        onCompleted: summary1 => {
          let iterator = 0;
          // if (relatedScenarios.length > 0) {
          //   this.notifications.push({
          //     type: 'impacted',
          //     nodeType: 'Scenarios',
          //     text: JSON.stringify(relatedScenarios).substring(1).slice(0, -1) + ' was impacted'
          //   });
          // }
          if (relatedScenarios.length < 1) {
            console.log('got');
            this.fetchUserSubscribtions();
          }
          for (let i = 0; i < relatedScenarios.length; i++) {
            this.neoConnect.getScenarioBlocks(projectName, relatedScenarios[i]).subscribe({
              onNext: record => {
                if (relatedBlocks.indexOf(record.get('blck').properties.name) === -1) {
                  relatedBlocks.push(record.get('blck').properties.name);
                  this.neoConnect.createNotification(this.currentProject, 'Block', record.get('blck').properties.name,
                    'impacted', record.get('blck').properties.name + ' was impacted').subscribe({
                    onCompleted: summary => {
                    },
                    onError: error2 => {
                      console.log(error2);
                    }
                  });
                  this.notifications.push({
                    type: 'impacted',
                    nodeType: 'Blocks',
                    text: record.get('blck').properties.name + ' was impacted'
                  });
                }
              },
              onCompleted: summary2 => {
                iterator++;
                console.log(iterator, relatedScenarios.length, relatedBlocks.length);
                if (iterator >= relatedScenarios.length) {
                  console.log('got');
                  setTimeout(this.fetchUserSubscribtions(), 1000);
                }
              },
              onError: err => {
                console.log(err);
              }
            });
          }
        }
      });
    } else {
      this.fetchNotifications();
    }
    console.log(this.notifications);
  }

  createNotificationsAboutSce(text: string, type: string, nodeType?: string, nameId?: string, projectName?: string) {
    this.notifications.push({
      type: type,
      nodeType: nodeType || '',
      text: text
    });
    this.neoConnect.createNotification(this.currentProject, nodeType, nameId, type, text).subscribe({
      onCompleted: summary => {
      },
      onError: error2 => {
        console.log(error2);
      }
    });
    const relatedReqs = [];
    const relatedBlocks = [];
    if (projectName) {
      this.neoConnect.getScenarioBlocks(projectName, nameId).subscribe({
        onNext: record => {
          if (relatedBlocks.indexOf(record.get('blck').properties.name) === -1) {
            relatedBlocks.push(record.get('blck').properties.name);
            this.neoConnect.createNotification(this.currentProject, 'Block', record.get('blck').properties.name,
              'impacted', record.get('blck').properties.name + ' was impacted', ).subscribe({
              onCompleted: summary => {
              },
              onError: error2 => {
                console.log(error2);
              }
            });
          }
        },
        onCompleted: summary2 => {
          this.neoConnect.getScenarioReqs(projectName, nameId).subscribe({
            onNext: record => {
              if (relatedReqs.indexOf(record.get('req').properties.id) === -1) {
                relatedReqs.push(record.get('req').properties.id);
                this.neoConnect.createNotification(this.currentProject, 'Requirement', record.get('req').properties.id,
                  'impacted', record.get('req').properties.id + ' was impacted').subscribe({
                  onCompleted: summary => {
                    this.fetchNotifications();
                  },
                  onError: error2 => {
                    console.log(error2);
                  }
                });
              }
            },
            onCompleted: summary2 => {
              if (relatedBlocks.length > 0) {
                this.notifications.push({
                  type: 'impacted',
                  nodeType: 'Requirements',
                  text: JSON.stringify(relatedReqs).substring(1).slice(0, -1) + ' was impacted'
                });
              }
            },
            onError: err => {
              console.log(err);
            }
          });
        },
        onError: err => {
          console.log(err);
        }
      });
    } else {
      this.fetchNotifications();
    }
    console.log(this.notifications);
  }
}

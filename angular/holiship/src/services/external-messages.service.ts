import { Injectable } from '@angular/core';

import { NeoConnectService } from './neo-connect.service';
import { NotificationsService } from './notifications.service';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class ExternalMessagesService {
  private subject = new Subject<any>();

  currProject: string;
  one = {
    'header': 'alan.node.create',
    'data': {
      'id': 1,
      'name': 'n',
      'parent': null,
      'attribut': null,
      'geometry': null,
      'group': [],
      'highLighted': 0,
      'position': {'x': 0, 'y': 0},
      'blow': 0
    }
  };

  two = {
    'header': 'alan.edge.create',
    'data': {
      'id': 0,
      'source': 2,
      'target': 1,
      'parameters': [],
      'attribut': null,
      'highLighted': 0,
      'tightness': []
    }
  };

  constructor(public neoConn: NeoConnectService,
              public notificationsService: NotificationsService) { }

  subjectUpdate(): Observable<any> {
    return this.subject.asObservable();
  }

  getMessage(msg: any) {
    console.log('receiving => ', msg, this.currProject);
    if (msg.hasOwnProperty('header')) {
      const head = msg['header'].split('.');
      if (head[1] == 'edge') {
        this.createEdge(msg);
      } else if (head[1] == 'node') {
        this.createBlock(msg);
      } else {
        console.error(msg, 'Unknown property of message!');
      }
    } else {
      console.error(msg, 'There was no header in message!');
    }
  }

  setupCurrentProject(projectName) {
    this.currProject = projectName;
  }

  createBlock(msg) {
    const block = {
      user: msg['header'].split('.')[0],
      id: msg.data.id,
      name: msg.data.name,
      parent: msg.data.parent
    };

    if (block.parent) {
      console.log('creatin child by uid', block);
      this.neoConn.createNewBlockChildByUId(this.currProject, block).subscribe({
        onNext: record => {},
        onCompleted: summary => {
          // console.log('child blck => ', summary);
          this.subject.next({msg: 'block created'});
          this.notificationsService.createNotifications(`Block '${block.name}'
         created by ${localStorage.getItem('user')} in project '${this.currProject}'`, 'created', 'Block', block.name, this.currProject);
        },
        onError: error => {
          console.error(error);
        }
      });
    } else {
      console.log('creatin block', block);
      this.neoConn.createBlock(this.currProject, block).subscribe({
        onNext: record => {},
        onCompleted: summary => {
          // console.log('blck => ', summary);
          if(msg['header']) this.subject.next({msg: 'block created'});
          this.notificationsService.createNotifications(`Block '${block.name}'
         created by ${localStorage.getItem('user')} in project '${this.currProject}'`, 'created', 'Block', block.name, this.currProject);
        },
        onError: error => {
          console.error(error);
        }
      });
    }
  }

  createEdge(msg, clb?: any) {
    const edge = {
      user: ( msg['header'] ? msg['header'].split('.')[0] : null ),
      id: msg.data.id,
      target: msg.data.target,
      source: msg.data.source
    };

    let child, parent;

    console.log('edge creating', edge, this.currProject, msg.data.source, msg.data.target);
    this.neoConn.createBlocksEdge(this.currProject, edge.source, edge.target, edge.id).subscribe({
      onNext: record => {
        // console.log('next edge => ', record);
        child = record.get('child');
        parent = record.get('parent');
        // console.log('next edge res => ', parent, child);
      },
      onCompleted: summary => {
        // console.log('edge => ', summary);
        // console.log('edge comp => ', parent, child);
        if (msg['header']) this.subject.next({msg: 'edge created'});
        this.notificationsService.createNotifications(`Block: '${parent.properties.name}' was
         connected to block: '${child.properties.name}' of '${this.currProject}' project by ${localStorage.getItem('user')}`, 'linked',
          'Block', parent.properties.name, this.currProject);
        if(clb) clb();
      },
      onError: error => {
        console.error(error);
      }
    });
  }

}

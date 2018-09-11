import {
  Component, OnInit, Output, Input, AfterViewInit, EventEmitter, ElementRef,
  ViewChild
} from '@angular/core';
import { NeoConnectService } from '../../services/neo-connect.service';

import * as vis from 'vis';
// declare var vis: any;
declare var $: any;

@Component({
  selector: 'app-state-modal',
  templateUrl: './state-modal.component.html',
  styleUrls: ['./state-modal.component.css']
})
export class StateModalComponent implements OnInit {
  @Input('block') block: any;
  @Input('project') project: string;
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('stateCont') stateCont: ElementRef;
  @ViewChild('hiddenEditStateTr') hiddenEditStateTr: ElementRef;
  @ViewChild('hiddenCreateStateTr') hiddenCreateStateTr: ElementRef;
  @ViewChild('hiddenEditTransitionTr') hiddenEditTransitionTr: ElementRef;
  @ViewChild('hiddenCreateTransitionTr') hiddenCreateTransitionTr: ElementRef;

  public canEditState: boolean;
  tmpData: any;
  clb: any;
  tmpLabel: string;
  network: any;
  topTrNum = 0;

  constructor(public neoConn: NeoConnectService) { }

  closeModal() {
    this.closeModalEvent.emit();
  }

  nodeCreator(id: any) {
    return {
      id: id,
      label: id,
      heightConstraint: 30,
      shape: 'circle'
    };
  }

  edgeCreator(fId, tId, name) {
    return {
      from: fId,
      to: tId,
      arrows: 'to',
      label: name,
      font: {align: 'top'},
      width: 1,
      length: 200
    };
  }

  stateEditOnChange($event, value) {
    this.canEditState = !!value;
  }

  stateEditOpen(clb, data) {
    this.tmpLabel = data.label;
    this.clb = clb;
    this.tmpData = data;

    this.hiddenEditStateTr.nativeElement.click();
  }

  transitionEditOpen(clb, data) {
    this.tmpLabel = data.label;
    this.clb = clb;
    this.tmpData = data;

    this.hiddenEditTransitionTr.nativeElement.click();
  }

  transitionEdit(value) {
    console.log(this.tmpData, value);
    this.neoConn.deleteTransition(this.project, this.block.identity, this.tmpData.from, this.tmpData.to, this.tmpData.label).subscribe({
      onNext: record => {
        console.log('next => ', record);
      },
      onCompleted: summary2 => {
        console.log(summary2);
        this.neoConn.createTransition(this.project, this.block.identity, this.tmpData.from, this.tmpData.to, value).subscribe({
          onNext: record => {
            console.log('next => ', record);
          },
          onCompleted: summary => {
            console.log(summary);
            this.getAndDraw();
          },
          onError: err => {
            console.error(err);
          }
        });
      },
      onError: err => {
        console.error(err);
      }
    });
  }

  stateCreateOpen(clb, data) {
    this.clb = clb;
    this.tmpData = data;

    this.hiddenCreateStateTr.nativeElement.click();
  }

  transitionCreateOpen(clb, data) {
    this.clb = clb;
    this.tmpData = data;

    this.hiddenCreateTransitionTr.nativeElement.click();
  }

  stateCreate(value) {
    console.log(value);
    this.neoConn.createState(this.project, this.block.identity, value).subscribe({
      onNext: record => {
        console.log('next => ', record);
      },
      onCompleted: summary => {
        console.log('completed => ', summary);
        this.getAndDraw();
      },
      onError: err => {
        console.error(err);
      }
    });

    this.clb(this.tmpData);
  }

  stateEdit(newValue) {
    // this.tmpData.label = newValue;

    console.log(newValue);
    this.neoConn.editState(this.project, this.block.identity, this.tmpData.label, newValue).subscribe({
      onNext: record => {
        console.log('next => ', record);
      },
      onCompleted: summary => {
        console.log('completed => ', summary);
        this.getAndDraw();
      },
      onError: err => {
        console.error(err);
      }
    });

    // this.clb(this.tmpData);
  }

  transitionCreate(value) {
    console.log(this.tmpData, value);
    this.neoConn.createTransition(this.project, this.block.identity, this.tmpData.from, this.tmpData.to, value).subscribe({
      onNext: record => {
        console.log('next => ', record);
      },
      onCompleted: summary => {
        console.log('completed => ', summary);
        this.getAndDraw();
      },
      onError: err => {
        console.error(err);
      }
    });
  }

  getAndDraw() {
    const nodes = [];
    const edges = [];
    const strNodes = [];
    this.topTrNum = 0;

    console.log('state block ==> ', this.block, this.block.identity);
    this.neoConn.getStates(this.project, this.block.identity).subscribe({
      onNext: record => {
        console.log('next state => ', record, record.get('stf').properties.name);
        if (strNodes.indexOf(record.get('stf').properties.name) < 0) {
          strNodes.push(record.get('stf').properties.name);
          nodes.push(this.nodeCreator(record.get('stf').properties.name));
        }
      },
      onCompleted: summary => {
        console.log('ready state => ', summary, nodes, strNodes, edges, this.topTrNum);

        this.neoConn.getTransitions(this.project, this.block.identity).subscribe({
          onNext: record => {
            console.log('next tr => ', record, record.get('stf').properties.name, record.get('tr.name'), record.get('stt').properties.name);

            edges.push(this.edgeCreator(record.get('stf').properties.name, record.get('stt').properties.name, record.get('tr.name')));
          },
          onCompleted: summary2 => {
            console.log('ready => ', summary2, nodes, strNodes, edges, this.topTrNum);

            const container = this.stateCont.nativeElement;

            const vNodes = new vis.DataSet(nodes);
            const vEdges = new vis.DataSet(edges);

            const data = {
              nodes: vNodes,
              edges: vEdges
            };

            const options = {
              locales: {
                // create a new locale (text strings should be replaced with localized strings)
                mylocale: {
                  edit: 'Edit',
                  del: 'Delete selected',
                  back: 'Back',
                  addNode: 'Add State',
                  addEdge: 'Add Transition',
                  editNode: 'Edit State',
                  editEdge: 'Edit Transition',
                  addDescription: 'Click in an empty space to place a new state.',
                  edgeDescription: 'Click on a state and drag the transition to another state to connect them.',
                  editEdgeDescription: 'Click on the control points and drag them to a state to connect to it.',
                  createEdgeError: 'Cannot link to a cluster.',
                  deleteClusterError: 'Clusters cannot be deleted.',
                  editClusterError: 'Clusters cannot be edited.'
                }
              },
              locale: 'mylocale',
              interaction: {
                dragNodes: true,
                dragView: false,
                hideEdgesOnDrag: false,
                hideNodesOnDrag: false,
                hover: false,
                hoverConnectedEdges: true,
                keyboard: {
                  enabled: false,
                  speed: {x: 10, y: 10, zoom: 0.02},
                  bindToWindow: true
                },
                multiselect: false,
                navigationButtons: false,
                selectable: true,
                selectConnectedEdges: false,
                tooltipDelay: 300,
                zoomView: false
              },
              manipulation: {
                enabled: true,
                initiallyActive: true,
                addNode: (data2, clb) => {
                  this.stateCreateOpen(clb, data2);
                },
                addEdge: (edgeData, callback) => {
                  console.log(edgeData);
                  if (edgeData.from === edgeData.to) return;
                  this.transitionCreateOpen(callback, edgeData);
                  // callback(edgeData);
                },
                // editNode: (data, clb) => {
                //   console.log(data);
                //   this.stateEditOpen(clb, data);
                // },
                // editNode: false,
                // editEdge: (data, clb) => {
                //   console.log(data);
                //   this.transitionEditOpen(clb, data);
                // },
                editEdge: false,
                deleteNode: (data, clb) => {
                  console.log(data, clb);
                  this.neoConn.deleteState(this.project, this.block.identity, data.nodes[0]).subscribe({
                    onCompleted: summary2 => {
                      this.getAndDraw();
                    },
                    onError: err => {
                      console.error(err);
                    }
                  });
                },
                deleteEdge: (data, clb) => {
                  const edge = edges.find((obj) => {
                    return obj.id === data.edges[0];
                  });
                  console.log('del tr ', edge, data);
                  this.neoConn.deleteTransition(this.project, this.block.identity, edge.from, edge.to, edge.label).subscribe({
                    onNext: record => {
                      console.log('next del tr => ', record);
                    },
                    onCompleted: summary2 => {
                      console.log('completed del tr', summary2);
                      this.getAndDraw();
                    },
                    onError: err => {
                      console.error(err);
                    }
                  });
                },
                controlNodeStyle: {
                  // all node options are valid.
                }
              }
            };
            this.network = new vis.Network(container, data, options);
            this.network.on('doubleClick', data => {
              console.log(data);
              this.tmpLabel = '';

              if (data.edges.length > 0) {
                const edge = edges.find((obj) => {
                  return obj.id === data.edges[0];
                });
                this.transitionEditOpen(null, edge);
                return;
              }

              if (data.nodes.length > 0) {
                const node = nodes.find((obj) => {
                  return obj.label === data.nodes[0];
                });
                this.stateEditOpen(null, node);
                return;
              }
            });
          },
          onError: err => {
            console.error(err);
          }
        });
      },
      onError: err => {
        console.error(err);
      }
    });
  }

  ngOnInit() {
    // console.log(this.project, this.block);
    $('#stateModal').on('shown.bs.modal', () => {
      this.getAndDraw();
    });
  }

}

import {
  Component, OnInit, Output, Input, EventEmitter, ElementRef,
  ViewChild
} from '@angular/core';

import * as vis from 'vis';
// mport * as Vis from 'vis';

// declare var vis: any;

@Component({
  selector: 'app-block-modal',
  templateUrl: './block-modal.component.html',
  styleUrls: ['./block-modal.component.css']
})
export class BlockModalComponent implements OnInit {
  @Input('block') block: any;
  @Input('project') project: string;
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('backCont') backCont: ElementRef;

  nodesArr: any[] = [];
  edgesArr: any[] = [];

  motherBubl: any = {
    id: 0,
    label: this.block ? this.block.name : 'No name',
    heightConstraint: {
      minimum: 350,
    },
    font: '50px arial grey',
    shape: 'circle',
    color: 'rgb(97,195,238)',
    x: 450,
    y: 450
  };

  globalOptions: any = {
    locales: {
      // create a new locale (text strings should be replaced with localized strings)
      mylocale: {
        edit: 'Edit',
        del: 'Delete selected',
        back: 'Back',
        addNode: 'Add Block',
        addEdge: 'Add Link',
        editNode: 'Edit Block',
        editEdge: 'Edit Link',
        addDescription: 'Click in an empty space to place a new block.',
        edgeDescription: 'Click on a block and drag the link to another block to connect them.',
        editEdgeDescription: 'Click on the control points and drag them to a block to connect to it.',
        createEdgeError: 'Cannot link to a cluster.',
        deleteClusterError: 'Clusters cannot be deleted.',
        editClusterError: 'Clusters cannot be edited.'
      }
    },
    // use the new locale
    locale: 'mylocale',
    edges: {
      smooth: false
    },
    manipulation: {
      enabled: true,
      initiallyActive: true,
      // addNode: true,
      // addEdge: true,
      // editNode: undefined,
      // editEdge: true,
      // deleteNode: true,
      // deleteEdge: true,
      controlNodeStyle: {
        // all node options are valid.
      }
    },
    physics: false,
    interaction: {
      dragNodes: true, // do not allow dragging nodes
      zoomView: false, // do not allow zooming
      dragView: false // do not allow dragging
    }
  };

  constructor() {
  }

  drawBack() {
    const container = this.backCont.nativeElement;
    this.motherBubl = {
      id: 0,
      label: this.block ? this.block.name : 'No name',
      heightConstraint: {
        minimum: 350,
      },
      font: '50px arial grey',
      shape: 'circle',
      color: 'rgb(97,195,238)',
      x: 450,
      y: 450
    };
    const data = {
      nodes: new vis.DataSet([this.motherBubl])
    };
    let options = (JSON.parse(JSON.stringify(this.globalOptions)));
    options.manipulation = false;

    console.log('before draving', container, data, options);
    let network = new vis.Network(container, data, options);
    network.moveTo({
      position: {
        x: 0,
        y: 0
      },
      // offset: {
      //   x: -900 / 2,
      //   y: -900 / 2
      // },
      scale: 1,
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  ngOnInit() {
    console.log('block in info ==> ', this.block);
    this.drawBack();
  }

}

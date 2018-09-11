import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

declare var vis: any;

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  @ViewChild('backCont') backCont: ElementRef;
  @ViewChild('frontCont') frontCont: ElementRef;

  private sub: any;
  project: string;
  MotherBblName: string;

  nodesArr: any[] = [];
  edgesArr: any[] = [];

  motherBubl: any = {
    id: 0,
    label: this.MotherBblName || 'Ship',
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

  constructor(public router: Router,  private route: ActivatedRoute) {
    this.nodesArr.push(this.nodeCreator('p00', 'Main engine', 450, 450));

    this.nodesArr.push(this.nodeCreator('p10', 'Admission/\nexhaust', 550, 400));
    this.nodesArr.push(this.nodeCreator('p11', 'HTFC circuit', 450, 550));
    this.nodesArr.push(this.nodeCreator('p12', 'Fuel circuit', 350, 400));

    this.nodesArr.push(this.nodeCreator('p20', 'Atmosphere', 690, 380));
    this.nodesArr.push(this.nodeCreator('p21', 'Gearbox,\nshaft &\npropeller', 690, 450));
    this.nodesArr.push(this.nodeCreator('p22', 'LTFC circuit', 450, 650));
    this.nodesArr.push(this.nodeCreator('p23', 'Steam circuit', 250, 600));
    this.nodesArr.push(this.nodeCreator('p24', 'Fuel tanks', 220, 350));
    this.nodesArr.push(this.nodeCreator('p25', 'Grey water\ntank', 250, 280));

    this.edgesArr.push(this.edgeCreator('p00', 'p10'));
    this.edgesArr.push(this.edgeCreator('p00', 'p21'));
    this.edgesArr.push(this.edgeCreator('p00', 'p12'));
    this.edgesArr.push(this.edgeCreator('p10', 'p20'));

    this.edgesArr.push(this.edgeCreator('p00', 'p11'));
    this.edgesArr.push(this.edgeCreator('p11', 'p22'));

    this.edgesArr.push(this.edgeCreator('p10', 'p22'));

    this.edgesArr.push(this.edgeCreator('p23', 'p12'));
    this.edgesArr.push(this.edgeCreator('p23', 'p11'));

    this.edgesArr.push(this.edgeCreator('p12', 'p24'));
    this.edgesArr.push(this.edgeCreator('p12', 'p25'));

    console.log('arrs ', this.edgesArr, this.nodesArr);
  }

  nodeCreator(id: any, label: string, x: number, y: number) {
    return {
      id: typeof id === ('number') || typeof id === ('string') ? id : 'n' + Math.random() + Math.random(),
      label: label || '' + x + ' ' + y || 'No Label',
      x: x,
      y: y
    };
  }

  edgeCreator(fId, tId) {
    return {
      from: fId,
      to: tId
    };
  }

  randomInteger(min: number, max: number) {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
  }

  drawFront() {
    const container = this.frontCont.nativeElement;
    const data = {
      nodes: new vis.DataSet(this.nodesArr),
      edges: new vis.DataSet(this.edgesArr)
    };
    let options = (JSON.parse(JSON.stringify(this.globalOptions)));

    console.log('before draving', container, data, options);
    let network = new vis.Network(container, data, options);
    network.moveTo({
      position: {
        x: 0,
        y: 0
      },
      offset: {
        x: -900 / 2,
        y: -900 / 2
      },
      scale: 1,
    });
  }

  drawBack() {
    const container = this.backCont.nativeElement;
    this.motherBubl = {
      id: 0,
      label: this.MotherBblName || 'Ship',
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
      offset: {
        x: -900 / 2,
        y: -900 / 2
      },
      scale: 1,
    });
  }

  goToBlocks() {
    this.router.navigate([`proj/${this.project}/blocks`]);
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.project = params['id'];
      this.MotherBblName = params['blockName'];
      console.log(this.project, this.MotherBblName,  ' project');
    });

    console.log(vis, this.backCont, this.frontCont);
    this.drawFront();
    this.drawBack();
  }
}

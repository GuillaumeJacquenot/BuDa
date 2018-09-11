import { Component, OnInit, Output, Input, EventEmitter, NgZone } from '@angular/core';

@Component({
  selector: 'app-compare-component',
  templateUrl: './compare-component.component.html',
  styleUrls: ['./compare-component.component.css']
})
export class CompareComponentComponent implements OnInit {
  @Input('topObj') topObj: any = {};
  @Input('compareArr') compareArr: any[];
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  public currObj: any = {};
  public leftObj: any = {};
  public select: any;

  constructor(private zone: NgZone) { }

  myInfo() {
    console.log('compare compnts: ', this.topObj, this.compareArr);
  }

  objCompare(obj1, obj2) {
    // console.log('compare ', obj1, ' and ', obj2);
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  selectLeftObj(ver) {
    console.log(ver);
    this.leftObj = {};
    // this.currObj = this.compareArr.find((obj) => obj.ver === ver);
    this.zone.run(() => {
      this.leftObj = this.compareArr.find((obj) => obj.ver === ver);
      console.log(this.leftObj);
    });
  }

  selectObj(ver) {
    console.log(ver);
    this.currObj = {};
    // this.currObj = this.compareArr.find((obj) => obj.ver === ver);
    this.zone.run(() => {
      this.currObj = this.compareArr.find((obj) => obj.ver === ver);
      console.log(this.currObj);
    });
  }

  ngOnInit() {
    this.myInfo();
    this.leftObj = this.compareArr[0];
    this.currObj = this.compareArr[1] ? this.compareArr[1] : this.compareArr[0];
  }

}

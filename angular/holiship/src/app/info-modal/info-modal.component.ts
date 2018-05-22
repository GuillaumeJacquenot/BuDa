import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent implements OnInit {

  @Input('data') data: any = {};
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  ngOnInit() {
  }
}

import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css']
})
export class AlertModalComponent implements OnInit {

  @Input('error') error: string;
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  ngOnInit() {
  }

  // ngAfterContentChecked() {
  //   console.log('Modal btn clicked');
  //   document.getElementById('hiddenTr').click();
  // }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent implements OnInit {

  @Input('currentVer') currentVer: any;
  @Output('createVerEvent') createVerEvent: EventEmitter<any> = new EventEmitter();
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  public form: FormGroup;

  constructor(private _fb: FormBuilder) { }

  createAndClose(title, desc) {
    console.log(title, desc);
    if (this.currentVer.title === title && this.currentVer.desc === desc) {
      this.closeModal();
    } else {
      this.createVerEvent.emit({
        currentVer: this.currentVer,
        title: title,
        desc: desc
      });
    }
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  ngOnInit() {
    this.form = this._fb.group({
      title: [' ', [Validators.required]],
      description: [' ', [Validators.required]]
    });

  }

}

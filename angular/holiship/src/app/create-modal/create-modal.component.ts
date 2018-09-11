import { Component, OnInit, Output, EventEmitter, AfterContentChecked, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-create-modal',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.css']
})
export class CreateModalComponent implements OnInit {
  public form: FormGroup;
  @Input('context') context: string;
  @Output('createNewEvent') createNewEvent: EventEmitter<any> = new EventEmitter();
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  constructor(private _fb: FormBuilder) {

  }

  createAndClose(id, title, desc) {
    console.log(id, title, desc);
    this.createNewEvent.emit({
      id: id.trim(),
      title: title.trim() || '',
      descr: desc.trim() || ''
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().split(' ').length > 1;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  ngOnInit() {
    this.form = this._fb.group({
      id: ['', [Validators.required, this.noWhitespaceValidator]],
      title: [''],
      description: ['']
    });
  }

}

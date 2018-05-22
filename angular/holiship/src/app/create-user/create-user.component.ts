import { Component, OnInit, Output, Input, EventEmitter, AfterContentChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  public form: FormGroup;

  @Output('createNewEvent') createNewEvent: EventEmitter<any> = new EventEmitter();
  @Output('closeModalEvent') closeModalEvent: EventEmitter<any> = new EventEmitter();

  @Input('closeable') closeable: boolean;

  constructor(private _fb: FormBuilder) { }

  createAndClose() {
    this.createNewEvent.emit(this.form.value);
  }

  closeModal() {
    console.log('closing');
    this.closeModalEvent.emit();
  }

  ngOnInit() {
    this.form = this._fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passwordCnf: ['', [Validators.required]]
    });
  }

}

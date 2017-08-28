import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-deactivate-vacante',
  templateUrl: './deactivate-vacante.component.html',
  styles: []
})
export class DeactivateVacanteComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formDeactivateVacante:FormGroup

  defaults = {
    creador: '',
    id: '',
    comments: '',
    fecha: ''
  }

  submitting:boolean = false

  saveAlert:boolean = false
  errorMsg:string = ""

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                public toastr: ToastsManager, vcr: ViewContainerRef
                ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.defaults['creador']=currentUser.hcInfo.id

    this.formDeactivateVacante = new FormGroup({
      creador:    new FormControl('', [ Validators.required ]),
      id:         new FormControl('', [ Validators.required ]),
      comments:   new FormControl(''),
      fecha:      new FormControl('', [ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] )
    })

  }

  buildForm( id, creador ){
    this.defaults['creador']  = creador
    this.defaults['id']       = id

    this.formDeactivateVacante.reset( this.defaults )
  }

  setVal( val, control ){
    this.formDeactivateVacante.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  submit(){

    this.submitting = true

    this._api.restfulPut(this.formDeactivateVacante.value, 'Headcount/deactivateVacante')
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.save.emit({form: "#form_DeactivateVacante"})
                this.formDeactivateVacante.reset( this.defaults )

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })

  }

  ngOnInit() {
  }

}

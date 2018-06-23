import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/service.index';

@Component({
  selector: 'app-agregar-cxc',
  templateUrl: './agregar-cxc.component.html',
  styles: []
})
export class AgregarCxcComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formAddCxc:FormGroup

  addCxCDetailsForm:Object = {
    asesor:           { tipo: 'text',     icon: 'fa fa-address-card-o fa-fw',   required: true, readonly: true,   pattern: ''},
    localizador:      { tipo: 'text',     icon: 'fa fa-hashtag fa-fw',          required: true, readonly: false,  pattern: 'Ingresa un localizador válido'},
    monto:            { tipo: 'text',     icon: 'fa fa-usd fa-fw',              required: true, readonly: false,  pattern: 'Ingresa el monto sin comas, y de 1 a 2 decimales'},
    fecha_cxc:        { tipo: 'date',     icon: 'fa fa-calendar-o fa-fw',       required: true, readonly: false,  pattern: 'Ingresa un formato de fecha correcto YYYY-MM-DD'},
    fecha_aplicacion: { tipo: 'date',     icon: 'fa fa-gavel fa-fw',            required: true, readonly: false,  pattern: 'Ingresa un formato de fecha correcto YYYY-MM-DD'},
    tipo:             { tipo: 'select',   icon: 'fa fa-indent fa-fw',           required: true, readonly: false,  pattern: ''},
    firmado:          { tipo: 'checkbox', icon: 'fa fa-check fa-fw',            required: true, readonly: false,  pattern: ''},
    comments:         { tipo: 'text',     icon: 'fa fa-commenting-o fa-fw',     required: true, readonly: false,  pattern: ''},
    created_by:       { tipo: 'text',     icon: 'fa fa-pencil-square-o fa-fw',  required: true, readonly: true,   pattern: ''},
    status:           { tipo: 'select2',  icon: 'fa fa-flag-o fa-fw',           required: true, readonly: false,  pattern: ''},
  }

  listTipos = [
    {id: 0, name: 'Responsabilidad'}
  ]

  listStatus = [
    {id: 0, name: 'Registrar'}
  ]

  submitting:boolean = false

  currentUser:any

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
                public toastr: ToastrService
                ){

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if(this.currentUser.credentials['cxc_apply'] == 1){
      this.listStatus.push({id: 1, name: 'Enviar a RRHH'})
      this.listTipos.push({id: 1, name: 'Colaborador'})
    }

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

    this.formAddCxc = new FormGroup({
      asesor: new FormControl('', [ Validators.required ] ),
      localizador: new FormControl('', [ Validators.required, Validators.pattern("^([5-9]{1}[0-9]{6}|[1]{1}[0-9]{7})$") ] ),
      monto: new FormControl('', [ Validators.required, Validators.pattern("^[1-9]{1}[0-9]*([.]{0,1}[0-9]{1,2}$|$)") ] ),
      fecha_cxc: new FormControl('', [ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
      fecha_aplicacion: new FormControl('', [ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
      tipo: new FormControl('', [ Validators.required ] ),
      firmado: new FormControl('indeterminate', [ this.checkChange ]),
      comments: new FormControl('', [ Validators.required ] ),
      created_by: new FormControl('', [ Validators.required ] ),
      status: new FormControl('', [ Validators.required ] )
    })

  }

  ngOnInit() {
  }

  //Validación Check
  checkChange( control: FormControl ): { [s:string]:boolean }{

    if( !control.dirty ){
      return {
        indeterminate: true
      }
    }else{
      return null
    }

  }

  setVal( val, control ){
    this.formAddCxc.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  buildForm( array ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.formAddCxc.controls['created_by'].setValue( currentUser.hcInfo['id'] )
    this.formAddCxc.controls['asesor'].setValue( array.idAsesor )
    this.formAddCxc.controls['status'].setValue( 0 )
  }

  submit(){
    this.submitting = true
    this._api.restfulPut( this.formAddCxc.value, "Cxc/addcxc" )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.save.emit({form: "#form_addCxc", status: true, date: this.formAddCxc.controls['fecha_aplicacion'].value})
                this.formAddCxc.reset()

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })
  }

}

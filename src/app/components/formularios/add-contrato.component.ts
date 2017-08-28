import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-contrato',
  templateUrl: './add-contrato.component.html',
  styles: []
})
export class AddContratoComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formAddContrato:FormGroup

  formAddContratoDetail:any = {
    tipo:             { tipo: 'select',   icon: 'fa fa-indent fa-fw',     show: true, required: true, readonly: false,  pattern: ''},
    inicio:           { tipo: 'date',     icon: 'fa fa-calendar-o fa-fw', show: true, required: true, readonly: false,  pattern: 'Ingresa un formato de fecha correcto YYYY-MM-DD'},
    fin:              { tipo: 'date',     icon: 'fa fa-calendar fa-fw',   show: false, required: true, readonly: false,  pattern: 'Ingresa un formato de fecha correcto YYYY-MM-DD'}
  }


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
                public toastr: ToastsManager, vcr: ViewContainerRef
                ){

    this.toastr.setRootViewContainerRef(vcr);

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

    this.formAddContrato = new FormGroup({
      asesor: new FormControl('', [ Validators.required ] ),
      inicio: new FormControl('', [ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
      fin: new FormControl(''),
      tipo: new FormControl('', [ Validators.required ] )
    })

    // Cambio en Ciudad -- Load Oficina
    this.formAddContrato.controls['tipo'].valueChanges.subscribe( res => {
      switch(res){
        case '2':

         this.formAddContrato.get('fin').setValidators([ Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ])
         this.formAddContrato.get('fin').reset()
         this.formAddContratoDetail.fin['show'] = false
         break
        case '1':

          this.formAddContrato.get('fin').setValidators([ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ])
          this.formAddContratoDetail.fin['show'] = true
          break
        default:
          break
      }

    });

  }

  ngOnInit() {
  }


  setVal( val, control ){
    this.formAddContrato.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  buildForm( array ){
    this.formAddContrato.reset()

    this.formAddContrato.controls['asesor'].setValue( array.idAsesor )

    this.submitting = false
  }

  submit(){
    this.submitting = true
    this._api.restfulPut( this.formAddContrato.value, "SolicitudBC/addContrato" )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.save.emit({form: "#form_addContrato", status: true})
                this.formAddContrato.reset()

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })
  }

}

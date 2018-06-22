import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-saldar-cxc',
  templateUrl: './saldar-cxc.component.html',
  styles: []
})
export class SaldarCxcComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formSaldarCxc:FormGroup
  formSaldarCxcDetail:Object

  submitting:boolean = false

  currentUser:any

  saveAlert:boolean = false
  errorMsg:string = ""

  asesor:number

  ready:boolean = false
  noRows:boolean = false

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                public toastr: ToastrService
                ){

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

  }

  ngOnInit() {
  }

  buildForm( array ){

    // Init Flags
    this.ready = false
    this.noRows = false
    this.asesor = array.idAsesor

    // Init Forms
    this.formSaldarCxcDetail = {}
    this.formSaldarCxc = new FormGroup({
      saldado_por: new FormControl( this.currentUser.hcInfo['id'] , [ Validators.required ] )
    })

    this.getSaldos( this.asesor )
  }

  getSaldos( asesor ){
    let saldos:any;

    this._api.restfulGet( asesor, 'Cxc/obtener_saldos' )
            .subscribe( res => {
              this.ready = true

              if(res['status']){

                if(res['rows'] != 0){

                  for(let cxc of res['data']){

                    this.formSaldarCxcDetail[cxc.id] = {
                      "quincena":     cxc.quincena,
                      "localizador":  cxc.localizador,
                      "monto":        cxc.monto
                    }

                    this.formSaldarCxc.addControl( cxc.id, new FormControl(false))

                  }


                }else{
                  this.noRows = true
                }

              }else{
                console.error( res )
              }

            })
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

  submit(){

    this.submitting = true

    this._api.restfulPut( this.formSaldarCxc.value, 'Cxc/saldar_cxc' )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.save.emit({form: "#form_saldarCxc", status: true})
                this.formSaldarCxc.reset()

                // console.log( res['msg'] )

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })

  }

}

import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

@Component({
  selector: 'app-bitacora-supers',
  templateUrl: './bitacora-supers.component.html',
  styleUrls: []
})
export class BitacoraSupersComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential='tabla_f'

  formBitacoraSuper:FormGroup

  formBitacoraSuperDetail:Object = {
    comments:         { tipo: 'text',  title: "Actividades del día",   icon: 'fa fa-commenting-o fa-fw',     required: true, readonly: false,  pattern: ''}
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
                public toastr: ToastsManager, vcr: ViewContainerRef,
                private _api:ApiService,
                private _init:InitService
                ) {

      this.currentUser = this._init.getUserInfo()
      this.showContents = this._init.checkCredential( this.mainCredential, true )


    this.toastr.setRootViewContainerRef(vcr);

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if(this.currentUser.credentials['cxc_apply'] == 1){
      this.listStatus.push({id: 1, name: 'Enviar a RRHH'})
      this.listTipos.push({id: 1, name: 'Colaborador'})
    }

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

    this.formBitacoraSuper = new FormGroup({
      asesor: new FormControl(this.currentUser.hcInfo.id, [ Validators.required ] ),
      comments: new FormControl('', [ Validators.required ] )
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
    this.formBitacoraSuper.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  buildForm( array ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.formBitacoraSuper.controls['created_by'].setValue( currentUser.hcInfo['id'] )
    this.formBitacoraSuper.controls['asesor'].setValue( array.idAsesor )
    this.formBitacoraSuper.controls['status'].setValue( 0 )
  }

  submit(){
    this.submitting = true
    this._api.restfulPut( this.formBitacoraSuper.value, "Bitacoras/addEntry" )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.toastr.success("Bitacora guardada correctamente", 'Aprobada!');
                this.formBitacoraSuper.reset({asesor: this.currentUser.hcInfo.id})

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                this.toastr.error("Bitacora guardada correctamente", 'Aprobada!');
                console.error( res )
              }
            })
  }

}

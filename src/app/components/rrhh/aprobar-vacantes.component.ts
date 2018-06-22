import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter,ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;


import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-aprobar-vacantes',
  templateUrl: './aprobar-vacantes.component.html',
  styles: []
})
export class AprobarVacantesComponent implements OnInit {

  showContents:boolean = false
  mainCredential:string = 'vacant_approve'


  formChangeStatus:FormGroup

  aprobaciones:any = {}
  aprobacionIndex:any
  aprobacionAction:any
  statusAction:string
  tipoAprobacion:any
  validando:boolean = false
  validacionStatus:boolean = false
  errorMsgValidacion:string

  ready:boolean = false
  showDetail:boolean = false

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
                private route:Router,
                private _init:InitService,
                public toastr: ToastrService
                ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )


    this.getSolicitudes()

    this.formChangeStatus = new FormGroup({
      solicitud: new FormControl('', [ Validators.required ] ),
      applier: new FormControl('', [ Validators.required ] ),
      accion: new FormControl('', [ Validators.required ] )
    })


  }

  getSolicitudes(){
    this._api.restfulGet( '', 'SolicitudesRH/getSolicitudesVacantes' )
            .subscribe( res => {
              if(res['status']){
                this.aprobaciones = res['data']
                this.ready = true
              }else{
                console.error( res )
              }
            })
  }

  ngOnInit() {
  }



submitChg( action, id ){

  this.submitting = true

  this.formChangeStatus.controls['solicitud'].setValue( id )
  this.formChangeStatus.controls['applier'].setValue( this.currentUser.hcInfo.id )
  this.formChangeStatus.controls['accion'].setValue( action )

  this._api.restfulPut( this.formChangeStatus.value, 'SolicitudesRH/approbeVacante' )
          .subscribe( res => {
            this.submitting = false

            if(res['status']){

              jQuery('#form_changeStatus').modal('hide')

              if(action){
                this.toastr.success(`La vacante ${ this.formChangeStatus.controls['solicitud'].value } fue Aprobada`, 'Aprobada!');
              }else{
                this.toastr.info(`La vacante ${ this.formChangeStatus.controls['solicitud'].value } fue Denegada`, 'Declinada!');
              }

              this.formChangeStatus.reset()

              this.getSolicitudes()

            }else{
              console.error( res )
              this.toastr.error('Hubo un error al procesar el cambio', 'Error');
            }
          })
}

}

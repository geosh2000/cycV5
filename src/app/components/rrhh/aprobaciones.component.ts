import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter,ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;


import { ApiService, InitService } from '../../services/service.index';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html',
  styles: []
})
export class AprobacionesComponent implements OnInit {

  showContents:boolean = false
  mainCredential:string = 'hc_cambios_aprobacion'


  formChangeStatus:FormGroup
  formApprobeBaja:FormGroup
  formApprobeCambio:FormGroup

  formApprobeBajaDetail:any = {
    id:                 { tipo: 'text',   title: 'Solicitud', icon: 'fa fa-hashtag fa-fw',     show: true, required: false, readonly: true,  pattern: ''},
    fechaBaja:          { tipo: 'date',   title: 'Fecha Baja', icon: 'fa fa-calendar fa-fw',   show: true, required: false, readonly: false,  pattern: ''},
    comentariosRRHH:    { tipo: 'text',   title: 'Comentarios', icon: 'fa fa-comment fa-fw',   show: true, required: false, readonly: false,  pattern: ''}
  }

  formChangeStatusDetail:any = {
    solicitud:              { tipo: 'text',   title: "id", icon: 'fa fa-hashtag fa-fw',     show: true, required: true, readonly: true,  pattern: ''},
    comentarios:             { tipo: 'text',  title: "Comentarios",  icon: 'fa fa-comment fa-fw',   show: true, required: true, readonly: false,  pattern: ''},
  }

  formApprobeCambioDetail:any = {
    id:                 { tipo: 'text',   title: 'Solicitud', icon: 'fa fa-hashtag fa-fw',     show: true, required: false, readonly: true,  pattern: ''},
    fechaBaja:          { tipo: 'date',   title: 'Fecha Cambio', icon: 'fa fa-calendar fa-fw',   show: true, required: false, readonly: false,  pattern: ''},
    comentariosRRHH:    { tipo: 'text',   title: 'Comentarios', icon: 'fa fa-comment fa-fw',   show: true, required: false, readonly: false,  pattern: ''}
  }


  aprobaciones:any  = {}
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
      comentarios: new FormControl('', [ Validators.required ] ),
      accion: new FormControl('', [ Validators.required ] )
    })

    this.formApprobeBaja = new FormGroup({
      id: new FormControl('', [ Validators.required ]),
      fechaBaja: new FormControl('', [ Validators.required ] ),
      comentarios: new FormControl(''),
      comentariosRRHH: new FormControl('', [ Validators.required ] ),
      recontratable: new FormControl(''),
      reemplazable: new FormControl(''),
      fechaLiberacion: new FormControl(''),
      applier: new FormControl(''),
      solicitud: new FormControl(''),
      approbe: new FormControl('')
    })


  }

  getSolicitudes(){
    this._api.restfulGet( '', 'SolicitudesRH/getSolicitudes' )
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

viewDetail( asesor ){
    this.showDetail = true
    setTimeout( () => {
      jQuery('#detailWindow').children('button').hide()
      this.route.navigate(['/aprobaciones_rrhh'], {fragment: 'detalle'})
    },500)

  }

closeDetail(){
  this.showDetail = false
}

changeStatus( action, id, tipo, index ){

  // console.log(this.aprobaciones[index])

  if(this.aprobaciones[index].tipo == "2"){

    let recont
    let reemp
    this.submitting = false

    if(this.aprobaciones[index].recontratable == 1){ recont=true}else{recont= false}
    if(this.aprobaciones[index].reemplazable == 1){ reemp=true}else{reemp= false}

    let form = {
      tipo:            2,
      id:              this.aprobaciones[index].asesor,
      fechaBaja:       this.aprobaciones[index].fecha,
      comentarios:     this.aprobaciones[index].comentarios,
      recontratable:   recont,
      reemplazable:    reemp,
      fechaLiberacion: this.aprobaciones[index].fecha_replace,
      applier:         this.currentUser.hcInfo['id'],
      approbe:         action,
      solicitud:       id,
    }

    this.formApprobeBaja.reset(form)

  }

  this.tipoAprobacion = tipo
  this.aprobacionIndex = index
  this.aprobacionAction = action

  if(tipo == 1){
    this.checkChangeStatus( id )
  }

  this.formChangeStatus.reset()

  this.formChangeStatus.controls['solicitud'].setValue( id )
  this.formChangeStatus.controls['applier'].setValue( this.currentUser.hcInfo.id )
  this.formChangeStatus.controls['accion'].setValue( action )

  if(action){
    this.statusAction = "Aprobar"
  }else{
    this.statusAction = "Declinar"
  }

  jQuery("#form_changeStatus").modal('show')
}

setVal( val, control ){
  this.formApprobeBaja.controls[control].setValue( val.format("YYYY-MM-DD") )
}

checkChangeStatus( id ){

  this.validando = true

  this._api.restfulGet( id, 'SolicitudesRH/statusCambio' )
          .subscribe( res => {

            this.validando = false

            if(res['status']){
              this.validacionStatus = true
            }else{
              console.error( res )
              this.errorMsgValidacion = res['msg']
              this.validacionStatus = false
            }

          })
}

submitChg(){

  this.submitting = true

  if(this.tipoAprobacion == 1){

    this._api.restfulPut( this.formChangeStatus.value, 'SolicitudBC/approbeChange' )
            .subscribe( res => {
              this.submitting = false

              if(res['status']){

                jQuery('#form_changeStatus').modal('hide')

                if(this.aprobacionAction){
                  this.toastr.success(`El cambio de ${ this.aprobaciones[this.aprobacionIndex].NombreAsesor } fue Aprobado y Procesado`, 'Aprobado!');
                }else{
                  this.toastr.info(`El cambio de ${ this.aprobaciones[this.aprobacionIndex].NombreAsesor } fue Denegado`, 'Declinado!');
                }

                this.getSolicitudes()

              }else{
                console.error( res )
                this.toastr.error('Hubo un error al procesar el cambio', 'Error');
              }
            })


  }else{

    let comments = this.formApprobeBaja.controls['comentariosRRHH'].value
    let recont
    if(this.formApprobeBaja.controls['recontratable'].value){
      recont = 1
    }else{
      recont = 0
    }

    if(this.formApprobeBaja.controls['fechaBaja'].value != this.aprobaciones[this.aprobacionIndex].fecha){
      comments = `${ comments } || Modificación hecha por RRHH -> Fecha de Baja: ${ this.formApprobeBaja.controls['fechaBaja'].value }`
    }

    if(recont != this.aprobaciones[this.aprobacionIndex].recontratable){
      let recontStatus = ""

      if(recont = 2){
        recontStatus = "NO "
      }
      comments = `${ comments } || Modificación hecha por RRHH -> ${ recontStatus }Recontratable`
    }

    this.formApprobeBaja.controls['comentariosRRHH'].setValue(comments)

    this._api.restfulPut( this.formApprobeBaja.value, 'SolicitudBC/bajaSet' )
            .subscribe( res => {
              this.submitting = false

              if(res['status']){

                jQuery('#form_changeStatus').modal('hide')

                if(this.aprobacionAction){
                  this.toastr.success(`La baja de ${ this.aprobaciones[this.aprobacionIndex].NombreAsesor } fue Aprobada y Procesada`, 'Aprobada!');
                }else{
                  this.toastr.info(`La baja de ${ this.aprobaciones[this.aprobacionIndex].NombreAsesor } fue Denegada`, 'Declinada!');
                }

                this.getSolicitudes()

              }else{
                console.error( res )
                this.toastr.error('Hubo un error al procesar la baja', 'Error');
              }
            })


  }
}

}

import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

@Component({
  selector: 'app-dias-pendientes',
  templateUrl: './dias-pendientes.component.html',
  styles: []
})
export class DiasPendientesComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  large:boolean = true
  mainCredential:string = 'schedules_upload'

  loading:Object = {}
  listData:any
  addName:boolean = false

  validateForm:Object = {}
  addForm:Object = {}
  approbeData:any = []
  rejectData:any = []

  detail:Object = {
    Nombre: null,
    asesor: null,
    data: null
  }

  detailData:Object = {
    hx: null,
    dt: null,
    sp: null
  }

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent


  constructor(public _api: ApiService,
                private _dateRangeOptions: DaterangepickerConfig,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService) {
    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._dateRangeOptions.settings = {
      autoUpdateInput: true,
      singleDatePicker: true,
      locale: { format: "YYYY-MM-DD" }
    }

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    moment.locale('es-MX')
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Dias Pendientes');
    this.resetForm()
    this.getAllList()
    this.toApprobe()
    this.rejected()
  }

  getAllList( asesor? ){
    this.loading['list'] = asesor ? false : true
    this.loading['detail'] = asesor ? true : false

    this._api.restfulGet( asesor ? asesor : '', 'Diaspendientes/getSummary' )
              .subscribe( res => {

                this.loading['list'] = false
                this.loading['detail'] = false

                if( asesor ){
                  this.detail['data'] = res['data']
                }else{
                  this.listData = res['data']
                }

                console.log(this.detail)

              }, err => {
                console.log("ERROR", err)

                this.loading['list'] = false
                this.loading['detail'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  toApprobe(){
    this.loading['toApprobe'] = true

    this._api.restfulGet( '', 'Diaspendientes/toApprobe' )
              .subscribe( res => {

                this.loading['toApprobe'] = false
                this.approbeData = res['data']

              }, err => {
                console.log("ERROR", err)

                this.loading['toApprobe'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  rejected(){
    this.loading['rejected'] = true

    this._api.restfulGet( '', 'Diaspendientes/rejected' )
              .subscribe( res => {

                this.loading['rejected'] = false
                this.rejectData = res['data']

              }, err => {
                console.log("ERROR", err)

                this.loading['rejected'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  detailed( asesor ){
    this.loading['detailed'] = true

    this._api.restfulGet( asesor, 'Diaspendientes/detail' )
              .subscribe( res => {

                this.loading['detailed'] = false
                this.detailData = res['data']

              }, err => {
                console.log("ERROR", err)

                this.loading['detailed'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  onSelected(item){
    this.addForm['asesor'] = item.asesor
  }

  resetForm(){
    this.addForm = {
      Fecha: moment().format('YYYY-MM-DD'),
      horas: '',
      asesor: '',
      motivo: ''
    }
    this.validateForm = {
      Fecha: true,
      horas: true,
      asesor: true,
      motivo: true
    }
  }

  validateAdd(){
    let flag = true
    for( let field in this.addForm ){
      if( this.addForm[field] == '' ){
        flag = false
        this.validateForm[field] = false
      }else{
        this.validateForm[field] = true
      }
    }

    return flag
  }

  saveAdd(){
    if( this.validateAdd() ){
      this.putSaveAdd()
    }else{
      this.toastr.error( "Debes llenar todos los campos para guardar el registro", `Falta Información!` )
    }
  }

  putSaveAdd(){
    this.loading['saveAdd'] = true

    this._api.restfulPut( this.addForm, 'Diaspendientes/saveAdd' )
              .subscribe( res => {

                this.loading['saveAdd'] = false
                this.toastr.success( "Campos correctos", `Guardado!` )
                this.resetForm()
                this.addName = false
                this.toApprobe()

              }, err => {
                console.log("ERROR", err)

                this.loading['saveAdd'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  setVal( inicio ){
    this.addForm['Fecha'] = inicio.format('YYYY-MM-DD')
  }

  aprResult( event ){
    console.log(event)
    if( event.status ){
      this.toastr.success( event.msg, 'Guardado' )
      this.toApprobe()
      this.rejected()
      this.getAllList()
    }else{
      this.toastr.error( event.msg, 'Error' )
    }
  }

  searchDetail( item ){
    this.detailData = {}
    this.detail['Nombre'] = item.Nombre
    this.detail['asesor'] = item.asesor
    this.getAllList( item.asesor )
    this.detailed( item.asesor )

    if( item.obj ){
      item.obj.select('tab-detail')
    }
  }

  delete( item ){
    this.loading['delete'] = true

    let params = {
      item: item,
      status: 3
    }

    this._api.restfulPut( params, 'Diaspendientes/approbe' )
              .subscribe( res => {

                this.loading['delete'] = false
                this.toastr.success( 'Evento borrado... para reestblecerlo solicita ayuda a Gerencia de WFM', 'Guardado' )
                this.detailed(this.detail['asesor'])

              }, err => {
                console.log("ERROR", err)

                this.loading['delete'] = false

                let error = err.error
                this.toastr.success( error.msg, 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  replaceStr( text ){
    return text.replace( /_/gm, ' ')
  }

}

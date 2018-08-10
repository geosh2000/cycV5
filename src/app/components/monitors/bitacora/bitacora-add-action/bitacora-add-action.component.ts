import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-bitacora-add-action',
  templateUrl: './bitacora-add-action.component.html',
  styles: []
})
export class BitacoraAddActionComponent implements OnInit {

  @Output() save = new EventEmitter
  @Output() delete = new EventEmitter

  loading:Object = {}

  form:Object = {}
  formDefault:Object = {
    Fecha: '',
    hg: '',
    skill: '',
    level: '',
    accion: '',
    comments: ''
  }

  flag:boolean = false

  lastAsesor:any
  lastUpdate:any

  actList:any = []

  item:any

  constructor(public _api: ApiService,
                public _init:InitService,
                public toastr: ToastrService) {
      this.getActions()
  }

  ngOnInit(){}

  build( item ){
    this.item = item
    this.form = JSON.parse(JSON.stringify(this.formDefault))
    let params = {
      Fecha: item['Fecha'],
      hg: item['hg'],
      skill: item['skill'],
      level: item['level']
    }
    this.getComments( params )
    jQuery('#bitAddModal').modal('show')
  }

  getActions(){
    this.loading['actions'] = true

    this._api.restfulGet( '', 'Bitacoras/actions')
        .subscribe( res => {

          this.loading['actions'] = false
          this.actList = res['data']

        }, err => {
          console.log('ERROR', err)
          this.loading['actions'] = false
          let error = err.json()
          this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
          console.error(err.statusText, error.msg)
        })
  }

  getComments( params ){
    this.loading['comments'] = true

    this._api.restfulPut( params, 'Bitacoras/comments')
        .subscribe( res => {

          this.loading['comments'] = false

          if( res['data'] ){
            let data = res['data']

            this.form['Fecha'] = data['Fecha']
            this.form['hg'] = data['hg']
            this.form['skill'] = data['skill']
            this.form['level'] = data['level']
            this.form['accion'] = data['accion']
            this.form['comments'] = data['comments']

            this.lastAsesor = data['Nombre']
            this.lastUpdate = data['last_update']

            this.flag = true
          }else{
            this.form = JSON.parse(JSON.stringify(this.formDefault))

            this.form['Fecha'] = params['Fecha']
            this.form['hg'] = params['hg']
            this.form['skill'] = params['skill']
            this.form['level'] = params['level']

            this.lastAsesor = null
            this.lastUpdate = null
            this.flag = false
          }


        }, err => {
          console.log('ERROR', err)
          this.loading['comments'] = false
          let error = err.json()
          this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
          console.error(err.statusText, error.msg)
        })
  }


  validate(){

    if( this.form['accion'] == '' || this.form['accion'] == null ){
      this.toastr.error('Debes seleccionar una acción', 'Inválido')
      return false
    }

    if( this.form['comments'] == '' || this.form['comments'] == null ){
      this.toastr.error('Debes ingresar notas', 'Inválido')
      return false
    }

    this.addNew()
    return true
  }

  addNew( ){
    this.loading['new'] = true

   this._api.restfulPut( this.form, `Bitacoras/new`)
          .subscribe( res => {

            this.loading['new'] = false
            jQuery('#bitAddModal').modal('hide')

            let item = JSON.parse(JSON.stringify(this.form))
            item['asesor'] = 'Yo'
            item['last_update'] = moment().format('YYYY-MM-DD HH:mm:ss')
            this.save.emit( item )

          }, err => {

            console.log('ERROR', err)

            this.loading['new'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

  deleteCom( ){
    this.loading['new'] = true

   this._api.restfulPut( this.item, `Bitacoras/delete`)
          .subscribe( res => {

            this.loading['new'] = false
            jQuery('#bitAddModal').modal('hide')

            let item = JSON.parse(JSON.stringify(this.item))
            this.delete.emit( item )

          }, err => {

            console.log('ERROR', err)

            this.loading['new'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

  close(){
    if( this.flag ){
      let item = JSON.parse(JSON.stringify(this.form))
      item['asesor'] = this.lastAsesor
      item['last_update'] = this.lastUpdate
      this.save.emit( item )
    }

    jQuery('#bitAddModal').modal('hide')
  }

}

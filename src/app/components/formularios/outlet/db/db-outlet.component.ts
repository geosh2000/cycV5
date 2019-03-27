import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';
import { EasyTableServiceService } from '../../../../services/easy-table-service.service';
import { OutletComponent } from '../outlet.component';

@Component({
  selector: 'app-db-outlet',
  templateUrl: './db-outlet.component.html',
  styles: []
})
export class DbOutletComponent implements OnInit, OnDestroy {

  @ViewChild(OutletComponent) _outlet:OutletComponent

  showContents:boolean = false
  edit:boolean = false
  mainCredential:string = 'default'
  currentUser:any

  loading:Object = {}

  timeout:any
  dbData:any = []
  dataForm:Object = {}
  confirmation:Object = {}
  tst:any
  src:any = ''
  showLoc:any = ''
  lvStatus:any = ''

  page:number = 1
  size:number = 20
  collection:number = 20

  meta:Object = {
    comments : '',
    folio : ''
  }

  config:EasyTableServiceService
  columns:any = [
    { type: 'default', key: 'id', title: 'id' },
    { type: 'default', key: 'Localizador', title: 'Localizador' },
    { type: 'default', key: 'Servicios', title: 'Servicios' },
    { type: 'default', key: 'VentaMxn', title: 'VentaMxn' },
    { type: 'default', key: 'clName', title: 'Nombre' },
    { type: 'default', key: 'customerEmail', title: 'Correo' },
    { type: 'default', key: 'customerFijo', title: 'Tel Fijo' },
    { type: 'default', key: 'customerMobile', title: 'Tel Movil' },
    { type: 'default', key: 'destination', title: 'Destino' },
    { type: 'default', key: 'hotel', title: 'Hotel' },
    { type: 'default', key: 'Contacto', title: 'Contacto' },
    { type: 'default', key: 'Status', title: 'Status' },
    { type: 'default', key: 'folio', title: 'folio' },
    { type: 'default', key: 'ActualizadoPor', title: 'ActualizadoPor' },
    { type: 'default', key: 'comments', title: 'Observaciones' },
    { type: 'default', key: 'Last_Update', title: 'Last_Update' },
  ]

  folioOn:boolean = false
  modal:any

  timerCount:number = 300;

  constructor(
                private _api:ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService,
                private modalService: NgbModal
                ) {
    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
          }
        })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Outlet VyV 2019');
    this.config =  EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 30
    this.config['paginationRangeEnabled'] = true
    this.getDB()
    this.timer()
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout)
  }

  getDB( refresh = false ){
    this.loading['data'] = true

    this._api.restfulGet( refresh ? 1 : 0, 'Outlet/db' )
              .subscribe( res => {

                this.loading['data'] = false

                if( refresh ){
                  for( let item of res['data'] ){
                    let index = this.dbData.map(function(e) { return e.id; }).indexOf(item['id']);
                    this.dbData[index]['folio'] = item['folio']
                    this.dbData[index]['status_changer'] = item['status_changer']
                    this.dbData[index]['comments'] = item['comments']
                    this.dbData[index]['Contacto'] = item['Contacto']
                    this.dbData[index]['Status'] = item['Status']
                    this.dbData[index]['Last_Update'] = item['Last_Update']
                    this.dbData[index]['ActualizadoPor'] = item['ActualizadoPor']
                  }
                }else{
                  this.dbData = res['data']
                }

                this.collection = res['data'].length

              }, err => {
                console.log('ERROR', err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  show( loc ){
    this.getLv( loc )
    this.showLoc = loc
    this.src = 'https://rsv.pricetravel.com.mx/reservations/show/'
  }

  getLv( loc ){
    this.loading['livest'] = true

    this._api.restfulGet( loc, 'Outlet/lvSt' )
              .subscribe( res => {

                this.loading['livest'] = false

                this.lvStatus = res['data']['live_status']


              }, err => {
                console.log('ERROR', err)

                this.loading['livest'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  chgStatus( id, field, val, content?, row?, edit = false ){
    this.folioOn = false

    this.meta['field'] = field
    this.meta['val'] = val
    this.meta['id'] = id
    let index = this.dbData.map(function(e) { return e.id; }).indexOf(id);
    this.meta['index'] = index

    if( field == 'Status'){
      this.folioOn = val == 1 ? true : false

      if( this.folioOn ){
        this.dataForm['editFlag'] = edit
        this.dataForm['id'] = row['id']
        this.dataForm['name'] = row['clName']
        this.dataForm['loc'] = row['Localizador']
        this.dataForm['correo'] = row['customerEmail']
        this.dataForm['tel'] = `${row['customerFijo']} / ${row['customerMobile']}`
        this.dataForm['folio'] = edit ? row['folio'] : ''
        this.tst = moment().format('x')
        this.confirmation = {}
        // console.log(this.dataForm)
        jQuery('#modalAgen').modal('show')
        // this.modal = this.modalService.open(content, { backdrop: 'static' });
        this.meta['comments'] = this.dbData[index]['comments']
      }else{
        this.updateStatus( field, val, id )
      }
    }else{
      this.updateStatus( field, val, id )
    }

  }

  updateFolio( e ){
    if( e.status ){
      console.log(e)
      this.updateStatus( 'Status', e['value'], this.dataForm['id'], e.folio, `${e['date']} (${e['tipo']=='0' ? 'presencial' : 'telefónica'})`)
      this.confirmation = e
      jQuery('#modalAgen').modal('hide')
      jQuery('#confirmAge').modal('show')
    }
  }

  updateStatus( field, val, id, folio?, c?){
    this.loading['update'] = true

    let params = {
        'field'   : field,
        'val'     : val,
        'folio'   : folio ? folio : this.meta['folio'],
        'comments': c ? c : this.meta['comments'],
        'id'      : id
    }

    this._api.restfulPut( params, 'Outlet/statusChg' )
              .subscribe( res => {

                this.loading['update'] = false
                // this.dbData[this.meta['index']][field] = val
                // this.dbData[this.meta['index']]['ActualizadoPor'] = this.currentUser['username']
                // this.dbData[this.meta['index']]['status_changer'] = this.currentUser['hcInfo']['id']
                // this.dbData[this.meta['index']]['comments'] = field == 'Status' ? (c ? c :this.meta['comments']) : this.dbData[this.meta['index']]['comments']
                // this.dbData[this.meta['index']]['folio'] = field == 'Status' && val == 1 ? folio ? folio : this.meta['folio'] : this.dbData[this.meta['index']]['folio']
                this.getDB(true)
                jQuery('#modalAgen').modal('hide')


              }, err => {
                console.log('ERROR', err)

                this.loading['update'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  timer(){
    if( this.timerCount == 0 ){
      this.timerCount = 300
      this.getDB( true )
    }else{
      this.timerCount--
    }

    this.timeout = setTimeout( () => this.timer(), 1000 )
  }
}

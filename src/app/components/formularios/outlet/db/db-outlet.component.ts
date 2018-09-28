import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

@Component({
  selector: 'app-db-outlet',
  templateUrl: './db-outlet.component.html',
  styles: []
})
export class DbOutletComponent implements OnInit {

  showContents:boolean = false
  edit:boolean = false
  mainCredential:string = 'default'
  currentUser:any

  loading:Object = {}

  dbData:any = []
  src:any = ""
  showLoc:any = ""
  lvStatus:any = ""

  page:number = 1
  size:number = 20
  collection:number = 20

  meta:Object = {
    comments : '',
    folio : ''
  }

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
    this.titleService.setTitle('CyC - DB 2018');
    this.getDB()
    this.timer()
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
                    this.dbData[index]['ActualizadoPor'] = item['ActualizadoPor']
                  }
                }else{
                  this.dbData = res['data']
                }

                this.collection = res['data'].length

              }, err => {
                console.log("ERROR", err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  show( loc ){
    this.getLv( loc )
    this.showLoc = loc
    this.src = "https://rsv.pricetravel.com.mx/reservations/show/"
  }

  getLv( loc ){
    this.loading['livest'] = true

    this._api.restfulGet( loc, 'Outlet/lvSt' )
              .subscribe( res => {

                this.loading['livest'] = false

                this.lvStatus = res['data']['live_status']


              }, err => {
                console.log("ERROR", err)

                this.loading['livest'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  chgStatus( id, field, val, content? ){
    this.folioOn = false

    this.meta['field'] = field
    this.meta['val'] = val
    this.meta['id'] = id
    let index = this.dbData.map(function(e) { return e.id; }).indexOf(id);
    this.meta['index'] = index

    if( field == 'Status'){
      this.folioOn = val == 1 ? true : false
      // jQuery('#folioModal').modal('show')
      this.modal = this.modalService.open(content, { backdrop: 'static' });
      this.meta['comments'] = this.dbData[index]['comments']
    }else{
      this.updateStatus( field, val, id )
    }

  }

  updateStatus( field, val, id ){
    this.loading['update'] = true

    let params = {
        'field'   : field,
        'val'     : val,
        'folio'   : this.meta['folio'],
        'comments': this.meta['comments'],
        'id'      : id
    }

    this._api.restfulPut( params, 'Outlet/statusChg' )
              .subscribe( res => {

                this.loading['update'] = false
                this.dbData[this.meta['index']][field] = val
                this.dbData[this.meta['index']]['ActualizadoPor'] = this.currentUser['username']
                this.dbData[this.meta['index']]['status_changer'] = this.currentUser['hcInfo']['id']
                this.dbData[this.meta['index']]['comments'] = field == 'Status' ? this.meta['comments'] : this.dbData[this.meta['index']]['comments']
                this.dbData[this.meta['index']]['folio'] = field == 'Status' && val == 1 ? this.meta['folio'] : this.dbData[this.meta['index']]['folio']
                this.modal.close()


              }, err => {
                console.log("ERROR", err)

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

    setTimeout( () => this.timer, 1000 )
  }
}

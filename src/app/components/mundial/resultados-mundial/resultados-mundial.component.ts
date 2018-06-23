import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-resultados-mundial',
  templateUrl: './resultados-mundial.component.html',
  styles: []
})
export class ResultadosMundialComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  saving:boolean = false
  mainCredential:string = 'schedules_diaspendientes'

  loading:Object = {}
  data:any = []
  positions:any = []

  edit:Object = {}
  pr:Object = {
    gf: {},
    gc: {},
    ended: {},
    live: {},
    editable : {}
  }

  totalPoints:number = 0
  userShown:boolean = false

  constructor(public _api: ApiService,
                private titleService: Title,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService,
                private modalService: NgbModal ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Quiniela Rusia 2018');
    this.getPartidos()
  }

  getPartidos(){
    this.loading['Partidos'] = true

    this._api.restfulGet( '', 'MundialFutbol/partidos' )
              .subscribe( res => {

                this.loading['Partidos'] = false
                this.data = res['data']
                let tp = 0
                for( let item of res['data'] ){
                  this.pr['gf'][item.id] = item.gf
                  this.pr['gc'][item.id] = item.gc
                  this.pr['live'][item.id] = item.live == '1' ? true : false
                  this.pr['ended'][item.id] = item.finalizado == '1' ? true : false
                  this.pr['editable'][item.id] = item.editable == '1' ? true : false
                }


              }, err => {
                console.log("ERROR", err)
                this.loading['Partidos'] = false
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              })
  }

  saveResult( index, l, v ){
    let params = {
      l: l,
      v: v,
      gf: this.pr['gf'][index],
      gc: this.pr['gc'][index],
      live: this.pr['live'][index] ? 1 : 0,
      ended: this.pr['ended'][index] ? 1 : 0,
      editable: this.pr['editable'][index] ? 1 : 0
    }

    this.loading['save'] = true

    this._api.restfulPut( params, 'MundialFutbol/resultSet' )
              .subscribe( res => {

                this.loading['save'] = false
                this.edit[index] = false
                this.getPartidos()
                this.toastr.success( "Resultado Guardado", "Guardado" )

              }, err => {
                console.log("ERROR", err)
                this.loading['save'] = false
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              })
  }



}

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
  selector: 'app-quiniela',
  templateUrl: './quiniela.component.html',
  styles: []
})
export class QuinielaComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  saving:boolean = false
  mainCredential:string = 'default'

  loading:Object = {}
  data:any = []
  positions:any = []

  edit:Object = {}
  pr:Object = {
    gf: {},
    gc: {}
  }

  totalPoints:number = 0
  userShown:boolean = false

  timeout:any
  timerCount = 300

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
            jQuery('#loginModal').modal('show');
          }
        })
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Quiniela Rusia 2018');
    this.getPartidos()
    this.timer()
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getPartidos(){
    this.loading['Partidos'] = true

    this._api.restfulGet( '', 'MundialFutbol/partidos' )
              .subscribe( res => {

                this.loading['Partidos'] = false
                this.data = res['data']
                let tp = 0
                for( let item of res['data'] ){
                  this.pr['gf'][item.id] = item.pr_gf
                  this.pr['gc'][item.id] = item.pr_gc
                  tp += this.getPoints(item)
                }

                this.totalPoints = tp
                this.userShown = false
                this.getTablaQ()

              }, err => {
                console.log('ERROR', err)
                this.loading['Partidos'] = false
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              })
  }

  getTablaQ(){
    this.loading['Posiciones'] = true

    this._api.restfulGet( '', 'MundialFutbol/tablaQuiniela' )
              .subscribe( res => {

                this.loading['Posiciones'] = false
                this.positions = res['data']

              }, err => {
                console.log('ERROR', err)
                this.loading['Posiciones'] = false
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              })
  }

  savePr( index ){
    let params = {
      id: index,
      gf: this.pr['gf'][index],
      gc: this.pr['gc'][index]
    }

    this.loading['save'] = true

    this._api.restfulPut( params, 'MundialFutbol/quiniela' )
              .subscribe( res => {

                this.loading['save'] = false
                this.edit[index] = false
                this.getPartidos()
                this.toastr.success( 'Pronóstico Guardado', 'Guardado' )

              }, err => {
                console.log('ERROR', err)
                this.loading['save'] = false
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              })
  }

  getPoints( item ){

    if( !(item.finalizado == 1 || item.live == 1) ){
      return 0
    }

    if( item.pr_gf == null || item.pr_gc == null ){
      return 0
    }

    let rg, gl, gv, mg
    let result = 0

    // =============================
    // START Eval Resultado Global
    // =============================
      if( item.pr_gf > item.pr_gc ){
        rg = ( item.gf > item.gc ) ? 10 : 0
      }
      if( item.pr_gf < item.pr_gc ){
        rg = ( item.gf < item.gc ) ? 10 : 0
      }
      if( item.pr_gf == item.pr_gc ){
        rg = ( item.gf == item.gc ) ? 10 : 0
      }
    // =============================
    // END Eval Resultado Global
    // =============================

    // =============================
    // START Eval Marcadores
    // =============================
      gl = ( item.gf == item.pr_gf ) ? 15 : 0
      gv = ( item.gc == item.pr_gc ) ? 15 : 0
      mg = ( item.gf == item.pr_gf && item.gc == item.pr_gc ) ? 20 : 0
    // =============================
    // END Eval Marcadores
    // =============================

    return result + rg + gl + gv + mg

  }

  displayUser(){
    this.userShown = true
  }

  editable( date ){
    if ( moment() < moment(date) ){
      return true
    }else{
      return false
    }
  }

  timer(){
    if(this.timerCount == 0){
      this.timerCount = 300
      this.getPartidos()
    }else{
      this.timerCount --
    }
    this.timeout = setTimeout( () => this.timer(), 1000)
  }

}

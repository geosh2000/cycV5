import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

import { OrderPipe } from 'ngx-order-pipe';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-sale-index-monitor',
  templateUrl: './sale-index-monitor.component.html',
  styles: []
})
export class SaleIndexMonitorComponent implements OnInit {

  mainCredential: any = 'default'
  showContents: boolean;
  currentUser: any;

  loading:Object = {}
  data:any = []
  orderBy:any = ['TotalIndex', 'Nombre']
  order:boolean = true

  constructor(
        private _api:ApiService,
        private _init:InitService,
        private titleService: Title,
        private _tokenCheck:TokenCheckService,
        public toastr: ToastrService,
        private op: OrderPipe,
        private _zh:ZonaHorariaService
        ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
              .subscribe( res => {

                if( res.status ){
                  this.showContents = this._init.checkCredential( this.mainCredential, true )
                }else{
                  this.showContents = false
                }
              })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Indice por Asesor');
    this.getData()
  }

  getData(){

    this.loading['data'] = false

    this._api.restfulGet( '35', 'VentaMonitor/indexMonitor')
    .subscribe( res => {

      this.loading['data'] = false
      this.data = this.op.transform( res['data'], this.orderBy, this.order)

    }, err => {
      console.log('ERROR', err)

      this.loading['data'] = false

      let error = err.json()
      this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
      console.error(err.statusText, error.msg)

    })

  }

  orderData( type, ord ){
    this.orderBy = type
    this.order = ord
    let data = this.data

    this.data = this.op.transform( data, type, ord )
  }

  formatBadge( index, value ){
    let params = {
      Locs: 1,
      Aht: 2,
      Fc: 3,
      Monto: 4,
      Total: 10
    }

    if( value < params[index] * 0.6 ){
      return 'badge-danger'
    }

    if( value < params[index] * 0.9 ){
      return 'badge-warning'
    }else{
      return 'badge-success'
    }

  }

  toNum( val ){
    return parseFloat(val)
  }

}

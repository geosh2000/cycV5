import { Component, OnInit, Injectable, ViewChild, OnDestroy } from '@angular/core';
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
export class SaleIndexMonitorComponent implements OnInit, OnDestroy {

  mainCredential: any = 'default'
  showContents: boolean;
  currentUser: any;

  loading:Object = {}
  data:any = []
  lu:any
  orderBy:any = ['TotalIndex', 'Nombre']
  order:boolean = true
  selected:any = 0

  colors:any = ['#3C3FB0','#7D45BF','#B1763E','#C54CAC','#C74D97']
  SupColor:Object = {}

  timeToReload:any  = 300
  timerCount:any    = this.timeToReload
  timeout:any

  orderPresets = [
    { title: 'Puntuación', order: 'TotalIndex', order_b: 'Nombre', desc: true, desc_b: true },
    { title: 'Supervisor / Nombre', order: 'Supervisor', order_b: 'Nombre', desc: false, desc_b: true },
    { title: 'Supervisor / Puntuación', order: 'Supervisor', order_b: 'TotalIndex', desc: false, desc_b: false },
    { title: 'Nombre', order: 'Nombre', order_b: 'Nombre', desc:false, desc_b: true }
  ]

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
    this.timerLoad()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getData(){

    this.loading['data'] = false

    this._api.restfulGet( '35', 'VentaMonitor/indexMonitor')
    .subscribe( res => {

      this.loading['data'] = false
      this.data = res['data']
      this.lu = res['lu']

      let i = 0
      for( let item of res['data'] ){
        if( !this.SupColor[item['idSup']] ){
          this.SupColor[item['idSup']] = this.colors[i]
          i++
        }
      }

      this.chgOrder( this.orderPresets[this.selected], this.selected )

    }, err => {
      console.log('ERROR', err)

      this.loading['data'] = false

      let error = err.error
      this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
      console.error(err.statusText, error.msg)

    })

  }

  chgOrder( orderObj, i ){
    console.log(orderObj)
    this.orderBy = JSON.parse(JSON.stringify(orderObj['order']))
    this.order = JSON.parse(JSON.stringify(orderObj['desc']))

    this.selected = i

    let data = this.data

    // data = this.op.transform( data, orderObj['order_b'], orderObj['desc_b'] )
    this.data = this.op.transform( data, [orderObj['order'], orderObj['order_b']], orderObj['desc'] )
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

  printTime( time, format ){
    return moment.tz(time, 'America/Mexico_city').tz(this._zh.zone).format(format)
  }

  timerLoad(){
    if( this.timerCount == 0 ){
      this.getData()
      this.timerCount = this.timeToReload
    }else{
      this.timerCount--
    }

    this.timeout = setTimeout( () => this.timerLoad(), 1000 )

  }

}

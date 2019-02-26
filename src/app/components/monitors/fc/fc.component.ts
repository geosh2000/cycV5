import { Component, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import * as moment from 'moment-timezone';

import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';

declare var jQuery:any;

@Component({
  selector: 'app-fc',
  templateUrl: './fc.component.html',
  styleUrls: ['./fc.component.css']
})
export class FcComponent implements OnInit, OnDestroy {

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  large:boolean = true
  mainCredential:string = 'default'
  timeout:any
  loading:Object = {}
  countTime:number = 120

  fc:Object = {
    'main' : {
      fc: 0, locs: 0, llamadas: 0
    },
    'pdv' : {
      fc: 0, locs: 0, llamadas: 0
    }
  }
  params:any = []
  lu:any

  constructor(
    private _api:ApiService,
    private _init:InitService,
    private titleService: Title,
    private _tokenCheck:TokenCheckService,
    private _zh:ZonaHorariaService,
    public toastr: ToastrService
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
    this.titleService.setTitle('CyC - FC del día');
    this.timer()
    this.getData()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  classColor( fc, bg:boolean = true ){
    let steps = this.params

    for( let item of steps ){
      if( fc >= parseFloat(item['b']) && fc < parseFloat(item['e']) ){
        return bg ? item['background'] : item['text']
      }
    }
  }

  timer(){
    if( this.countTime == 0 ){
      this.getData()
      this.countTime = 120
    }
    this.countTime--
    this.timeout = setTimeout( () => this.timer(), 1000 )
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( '', 'Venta/fcActual' )
            .subscribe( res => {

              this.loading['data'] = false
              this.fc['main'] = res['data']['result']['main']
              this.fc['pdv'] = res['data']['result']['pdv']
              this.lu = res['data']['lu']['lu']
              this.params = res['params']

            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)
            })
  }

  printTime( time, format ){
    return moment.tz(time, 'America/Mexico_city').tz( this._zh.zone ).format( format )
  }

  parse( val ){
    return parseFloat(val)
  }

}

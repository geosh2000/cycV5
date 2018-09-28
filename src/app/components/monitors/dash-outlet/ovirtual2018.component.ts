import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

@Component({
  selector: 'app-ovirtual2018',
  templateUrl: './ovirtual2018.component.html',
  styles: []
})
export class Ovirtual2018Component implements OnInit {

  allData:any
  canalData:Object = {}
  lu:any
  selDate:any = moment()>moment('2018-05-20') ? 'Todo' : moment().format('YYYY-MM-DD')
  timerCount = 300
  timeout:any

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  large:boolean = true
  mainCredential:string = 'tablas_f'

  loading:Object = {}

  constructor(public _api: ApiService,
                private _init:InitService,
                private _zh:ZonaHorariaService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService ) {
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
    this.titleService.setTitle('CyC - Outlet Virtual 2018');
    this.getData()
    this.timerLoad()
  }

  ngOnDestroy() {
    clearTimeout(this.timeout)
  }

  unixTime( time ){
    // DEFINE UNIX TIME
    let m = moment.tz(`${ time }`, "America/Mexico_city")
    let local = m.clone().tz( this._zh.zone )
    let dif = moment(m.format('YYYY-MM-DD HH:mm:ss')).diff(local.format('YYYY-MM-DD HH:mm:ss'), 'hours')
    m.subtract((5+(dif*(-1))), 'hours')
    return m
  }

  buildData(data){
    let allData = {}
    for( let date in data ){
      if( !allData[date] ){
        allData[date] = {
          ly: [],
          ty: [],
          hotel: [],
          meta: [],
          meta_hotel: [],
          meta_bi: [],
          meta_bi_hoteles: []
        }
      }

      for( let item of data[date] ){
        for( let it in allData[date] ){
          allData[date][it].push([parseInt(this.unixTime(`${item['time']}`).format('x')), item[it]])
        }
      }
    }

    return allData
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( '','Outlet/v2018dashPorHora' )
              .subscribe( res => {

                this.loading['data'] = false
                this.allData = this.buildData(res['data']['all'])
                this.lu = res['lu']['LU']
                this.canalData = {}
                this.loading['data'] = false
                for(let canal in res['data']['canal']){
                  this.canalData[canal] = this.buildData(res['data']['canal'][canal])
                }
                console.log(res['data'])
                console.log(this.canalData)
              }, err => {
                console.log("ERROR", err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  timerLoad(){
    if(this.timerCount == 0){
      this.timerCount = 300
      this.getData()
    }else{
      this.timerCount--
    }

    this.timeout = setTimeout( () => this.timerLoad(), 1000)
  }

}

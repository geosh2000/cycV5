import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

@Component({
  selector: 'app-dash-outlet',
  templateUrl: './dash-outlet.component.html',
  styles: []
})
export class DashOutletComponent implements OnInit {

  allData:any
  canalData:Object = {}
  lu:any
  selDate:any = '2018-05-10'
  timerCount = 300

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  large:boolean = true
  mainCredential:string = 'tablas_f'

  loading:Object = {}
  timeout:any

  constructor(public _api: ApiService,
                private _init:InitService,
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
    this.titleService.setTitle('CyC - Outlet VV 2018');
    this.getData()
    this.timerLoad()
  }

  ngOnDestroy() {
    clearTimeout(this.timeout)
  }

  unixTime( time ){
    // DEFINE UNIX TIME
    let m = moment.tz(`${ time }`, "America/Mexico_city")
    let local = m.clone().tz("America/Bogota")
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

    this._api.restfulGet( '','Outlet/dashPorHora' )
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

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
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

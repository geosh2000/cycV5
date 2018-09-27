import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ApiService, InitService, TokenCheckService, GlobalServicesService, ZonaHorariaService } from '../../../services/service.index';

import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
declare var jQuery:any;

@Component({
  selector: 'app-queues-v3',
  templateUrl: './queues-v3.component.html',
  styles: []
})
export class QueuesV3Component implements OnInit, OnDestroy {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'
  timeout:any
  timerCount = 2
  timer:Object = {
    success: 2,
    error: 1
  }

  displays = {
   a: true,
   b: false,
   c: false,
   d: false,
   e: false,
  }

  display:Object = {
    sm: true
  }

  paused:boolean = false
  loading:Object = {}
  dataQ:any = []
  qData:Object = {}

  allQs = {}
  countrySelected:any = 'CO'


  constructor( public _api: ApiService,
                  private titleService: Title,
                  private _init:InitService,
                  public _zh:ZonaHorariaService,
                  private _tokenCheck:TokenCheckService,
                  private _global: GlobalServicesService,
                  private toastr:ToastrService,
                  private route:Router, private activatedRoute:ActivatedRoute) {

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


  this.activatedRoute.params.subscribe( params => {
    // if( params.skill ){
    //   this.skillSelected = params.skill
    //   jQuery('#qSel').val(this.skillSelected)
    // }

    // if( params.monitor == 1 ){
    //   this.displayFilter = false
    //   this._global.displayMonitor( true )
    // }else{
    //   this.displayFilter = true
    //   this._global.displayMonitor( false )
    // }
  })

  this.getQueues()
}

  ngOnInit() {
    this.titleService.setTitle('CyC - Monitor Colas');
    this.getData()
  }

  colsGet(){
    let w = 0
    for( let it in this.displays ){
      if(this.displays[it] ){
        w++
      }
    }

    return w
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getQueues(){
    this.loading['queues'] = true

    this._api.restfulGet( '','Queuemetrics/getQs' )
              .subscribe( res => {

                this.loading['queues'] = false
                let qData = {
                  MX: {},
                  CO: {}
                }

                for( let item of res['data'] ){

                  if( !qData[item['sede']][item['Departamento']] ){
                    qData[item['sede']][item['Departamento']] = []
                  }

                  qData[item['sede']][item['Departamento']].push(item)
                }

                let allQs = {
                  MX: [],
                  CO: []
                }
                // tslint:disable-next-line:forin
                for( let pais in qData ){
                  this.qData[pais] = []


                  // tslint:disable-next-line:forin
                  for( let q in qData[pais] ){
                    let tmp = {
                      id: q,
                      text: q,
                      children: []
                    }

                    for( let it of qData[pais][q] ){
                      tmp['children'].push({ id: it['queue'], text: it['Cola'] })
                      allQs[pais].push({ id: it['queue'], text: it['Cola'] })
                    }

                    this.qData[pais].push( tmp )
                  }

                }
                this.allQs = allQs



              }, err => {
                console.log('ERROR', err)

                this.loading['queues'] = false

                let error = err.error
                this.toastr.error( error.msg, err.statusText )
                console.error(err.statusText, error.msg)

              })
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${ this.countrySelected == 'MX' ? 'MX' : ''}`,'Queuemetrics/rtCallsCO' )
              .subscribe( res => {

                this.loading['data'] = false
                let dataQ = []
                let callers = []

                for( let item of res['data'] ){
                  item['qs'] = item['Queue'] ? item['Queue'].split(':') : []

                  if( callers.indexOf( item['caller']) == -1 ){
                    callers.push(item['caller'])
                  }else{
                    item['caller'] = null
                    item['Q'] = null
                    item['RT_dnis'] = null
                    item['direction'] = null
                    item['lastTst'] = item['freeSince']
                  }

                  dataQ.push(item)
                }

                this.dataQ = dataQ

                this.timerCount = this.timer['success']
                this.startTimer()

              }, err => {
                console.log('ERROR', err)

                this.loading['data'] = false

                this.timerCount = this.timer['error']
                this.startTimer()

                let error = err.error
                this.toastr.error( error.msg, err.statusText )
                console.error(err.statusText, error.msg)

              })
  }

  startTimer(){

    if( this.timerCount == 0 ){
      this.getData()
    }else{
      this.timerCount --
      this.timeout = setTimeout( () => this.startTimer(), 1000 )
    }

  }

  pause(){
    if( this.paused ){
      this.paused = false
      this.timerCount = 0
      this.startTimer()
    }else{
      this.paused = true
      clearTimeout(this.timeout)
    }
  }




}

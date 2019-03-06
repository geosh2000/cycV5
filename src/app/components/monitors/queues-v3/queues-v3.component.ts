import { Component, OnDestroy, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ApiService, InitService, TokenCheckService, GlobalServicesService, ZonaHorariaService } from '../../../services/service.index';

import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { CallBlockComponent } from './call-block/call-block.component';
declare var jQuery:any;

@Component({
  selector: 'app-queues-v3',
  templateUrl: './queues-v3.component.html',
  styles: []
})
export class QueuesV3Component implements OnInit, OnDestroy {

  @ViewChild('blockMain') _callb:CallBlockComponent
  @Input() countrySelected:any = 'CO'
  @Input() hideHead:boolean = false
  @Input() useTotals:boolean = false
  @Input() viewParams:Object = {
              small: true,
              qs: false,
              displays: {
                v1: { active: true,  detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
                v2: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
                v3: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
                v4: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
                v5: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] }
              }
            }
  @Input() totals:Object = {}

  @Output() skillSel = new EventEmitter<any>()

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
  skillSelected:any = 'CO'

  skillList:Object = {
    35: 'MX - MX Soporte Agencias Main'
  }

  qList:any = []
  ahtLimits:Object = {}

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

  if( !this.hideHead ){
    this.activatedRoute.params.subscribe( params => {
      if( params.pais ){
        this.countrySelected = params.pais ? params.pais : 'CO'

        if( params.params ){
          let param = params.params.split('|'), i=0
          // console.log(param)
          for( let p of param ){
            switch(i){
              case 0:
                this.viewParams['small'] = p == 1 ? true : false
                break
              case 1:
                this.viewParams['qs'] = p == 1 ? true : false
                break
              case 2:
              case 3:
              case 4:
              case 5:
              case 6:
                let qParams = p.split(',')
                let qQs = qParams[6].split('-')
                this.viewParams['displays'][`v${i-1}`] = {
                  active: qParams[0] == 1 ? true : false,
                  bySkill: qParams[1] == 1 ? true : false,
                  detail: qParams[2] == 1 ? true : false,
                  bigDetail: qParams[3] == 1 ? true : false,
                  waits: qParams[4] == 1 ? true : false,
                  skill: qParams[5],
                  qs: qQs
                }
                break
            }
            i++
          }
        }
      }

    })
  }

  this._tokenCheck.getTokenStatus()
    .subscribe( res => {
        if( res.status ){
          this.showContents = this._init.checkCredential( this.mainCredential, true )
        }else{
          this.showContents = false
      }
    })


  this.getQueues()
}

  ngOnInit() {
    this.titleService.setTitle('CyC - Monitor Colas');
    this.getData()
    this.getQList()
    this.getAhtRefresh()
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
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getQList( event? ){
    this.loading['qList'] = true

    this._api.restfulGet( !event ? this.countrySelected : event,'Lists/monitorSkills' )
              .subscribe( res => {

                this.loading['qList'] = false
                this.qList = res['data']

              }, err => {
                console.log('ERROR', err)

                this.loading['qList'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${ this.countrySelected == 'MX' ? 'MX' : ''}`,'Queuemetrics/rtCallsCO' )
              .subscribe( res => {

                this.loading['data'] = false
                let dataQ = []
                let callers = [], waits = [], indCall

                for( let item of res['data'] ){
                  item['qs'] = item['Queue'] ? item['Queue'].split(':') : []

                  if( (indCall = callers.indexOf( `${item['RT_dnis']}:${item['caller']}` )) == -1 ){
                    callers.push(`${item['RT_dnis']}:${item['caller']}`)
                    waits.push(item['waiting'])
                    item['xfered_cc'] = 0
                  }else{
                    item['xfered_cc'] = item['caller'] == null ? 0 : 1

                    if( item['caller'] != 'anonymous' ){
                      item['caller'] = null
                      item['Q'] = null
                      item['RT_dnis'] = null
                      item['direction'] = null
                      item['lastTst'] = item['xfered_cc'] == 1 ? waits[indCall] : item['freeSince']
                      item['indCall'] = indCall
                      // item['lastTst'] = item['freeSince']
                    }
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
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  startTimer(){

    if( this.timerCount == 0 ){
      this.getData()
    }else{
      if( !this.paused ){
        this.timerCount --
      }
      this.timeout = setTimeout( () => this.startTimer(), 1000 )
    }

  }

  getAhtRefresh(){
    this.getAhtLimits()
    setTimeout( () => this.startTimer(), 1800000 )
  }

  pause(){
    if( this.paused ){
      this.timerCount = 0
      this.paused = false
    }else{
      this.paused = true
    }
  }

  printTime( time, format ){
    return moment.tz(time, 'America/Mexico_city').tz(this._zh.zone).format(format)
  }

  getAhtLimits(){

    this.loading['ahts'] = true

    this._api.restfulGet( '','Queuemetrics/lastAhtLimit' )
              .subscribe( res => {

                this.loading['ahts'] = false

                this.ahtLimits = res['data']

              }, err => {

                this.loading['ahts'] = false

                console.log('ERROR', err)

                let error = err.error
                console.error(err.statusText, error.msg)

              })
  }

  emitSkill( val ){
    this.skillSel.emit(val)
  }




}

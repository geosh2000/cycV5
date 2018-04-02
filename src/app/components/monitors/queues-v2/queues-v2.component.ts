import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';
import { GlobalServicesService } from '../../../services/global-services.service'

import * as moment from 'moment-timezone';
declare var jQuery:any;

@Component({
  selector: 'app-queues-v2',
  templateUrl: './queues-v2.component.html',
  styles: []
})
export class QueuesV2Component implements OnInit {

  @Output() monitor = new EventEmitter<any>()

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  displayFilter:boolean       = true
  loading:boolean       = false
  data:Object           = {}
  waits:Object           = {}
  agents:Object
  queues:Object
  pauses:Object
  queueGroups:Object
  skillGroup:Object     = {}
  deps:Object
  ordG:any
  lu:string

  loop:boolean          = true
  loopTime:number       = 5000

  display:Object = {
    wait: false,
    detail: false,
    queue: false,
    sum: true,
    calls: true,
    byQueue: false
  }

  skillSelected:string  = '35'

  timeToReload:number = 2
  timerFlag:boolean = true
  count:number = 5

  constructor( public _api: ApiService,
                private titleService: Title,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                private _global: GlobalServicesService,
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
      if( params.skill ){
        this.skillSelected = params.skill
        jQuery('#qSel').val(this.skillSelected)
      }

      if( params.monitor == 1 ){
        this.displayFilter = false
        this._global.displayMonitor( true )
      }else{
        this.displayFilter = true
        this._global.displayMonitor( false )
      }
    })

    this.getInitials()
  }

  loopChg(){
    this.timerFlag = !this.timerFlag
  }

  getInitials(){
    this.getQueues()
    this.getPauseTypes()
    this.getDeps()
    console.log(this.skillSelected)
    setTimeout( () => this.getRtCalls( this.skillSelected, true ), 3000)
  }

  test(){
    this._api.testGet().subscribe( res => console.log(res))
  }

  getAll(){
      this.getRtCalls( this.skillSelected )
  }

  reloadCalls( event ){
    this.getRtCalls( event )
  }

  getRtCalls( skill, firstLoad = false ){
    this.timerFlag = false
    this.loading = true

    if( firstLoad ){
      this.timerLoad()
    }


    let params = {
      queues: this.queueGroups[skill]
    }

    this._api.restfulPut( params, 'RtMonitor/rtMonitor' )
            .subscribe( res => {
              this.loading = false
              this.data=res.data['data']
              this.waits=res.data['waits']
              this.lu= res.data['lu']

              this.count = this.timeToReload
              this.timerFlag = true
              console.log(res)


              // console.log(this.data)

            }, err => {
              console.log("ERROR", err)
              this.loading = false
              this.count = this.timeToReload
              this.timerFlag = true
            })
  }

  formatDate(datetime, format){
    if(datetime == null){
      return ""
    }

    let time = moment.tz(datetime, "America/Mexico_City")
    let cunTime = time.clone().tz("America/Bogota")

    return cunTime.format(format)
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Queue Monitor');
  }


  getQueues(){

    this.loading = true

    this._api.restfulPost( '', 'Queuemetrics/queues' )
            .subscribe( res => {

              this.loading = false
              let queues = res.data
              let keys = []
              let result = {}
              let group = {}
              let dispSum = {}
              group[0] = []

              for( let item of queues ){

                if( !keys.indexOf( item['monShow'] ) ){
                  keys.push( item['monShow'] )
                }

                result[ item['queue'] ] = item

                if( !group[ item['monShow'] ] ){
                  group[ item['monShow'] ] = [item['queue']]
                }else{
                  group[ item['monShow'] ].push(item['queue'])
                }

                dispSum[ item['monShow'] ] = item['displaySum']

                group[0].push(item['queue'])
                this.skillGroup[0] = 'All'
                this.skillGroup[item['monShow']] = item['Departamento']
                group[ item['monShow'] ].sort()
              }


              this.queues = result
              this.queueGroups = group
              this.queueGroups

              let ordG = []
              for( let q in this.queueGroups ){
                if( q != "0" && dispSum[q] == "1" ){
                  ordG.push( { index: q, name: this.skillGroup[q] } )
                }
              }

              ordG.sort()
              this.ordG = ordG


            }, err => {
              console.log("ERROR", err)
              this.loading = false

            })

  }

  getPauseTypes(){

    this.loading = true

    this._api.restfulGet( '', 'Queuemetrics/pauses' )
            .subscribe( res => {

              this.loading = false
              this.pauses = res.data

            }, err => {
              console.log("ERROR", err)
              this.loading = false

            })

  }

  getDeps(){
    // console.log("Running deps...")
    this.loading = true

    this._api.restfulPost( '', 'Queuemetrics/asesorDep' )
            .subscribe( res => {

              this.loading = false
              let deps = res.data
              let result = {}
              for( let item of deps ){
                result[ item['name'] ] = item
              }

              this.deps = result

            }, err => {
              console.log("ERROR", err)
              this.loading = false

            })

  }

  timerLoad(){
    if( this.timerFlag ){
      if( this.count == 0 ){
        this.getRtCalls( this.skillSelected )
      }
      this.count--
    }

    setTimeout( () => this.timerLoad(), 1000 )
  }

  activateMonitor(){
    this.displayFilter = false
  }

}

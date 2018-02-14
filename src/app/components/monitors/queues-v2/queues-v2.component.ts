import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-queues-v2',
  templateUrl: './queues-v2.component.html',
  styles: []
})
export class QueuesV2Component implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'monitor_gtr'

  loading:boolean       = false
  data:Object           = {}
  waits:Object           = {}
  agents:Object
  queues:Object
  pauses:Object
  queueGroups:Object
  skillGroup:Object     = {}
  deps:Object
  lu:string

  loop:boolean          = true
  loopTime:number       = 5000

  display:Object = {
    wait: false,
    detail: true,
    queue: true,
    sum: true,
    calls: true,
    byQueue: false
  }

  skillSelected:string  = '35'

  timeToReload:number = 2
  timerFlag:boolean = true
  count:number = 5

  constructor( public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService, ) {

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

    this.getInitials()
  }

  loopChg(){
    this.timerFlag = !this.timerFlag
  }

  getInitials(){
    this.getQueues()
    this.getPauseTypes()
    this.getDeps()
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

                group[0].push(item['queue'])
                this.skillGroup[0] = 'All'
                this.skillGroup[item['monShow']] = item['Departamento']
                group[ item['monShow'] ].sort()
              }


              this.queues = result
              this.queueGroups = group
              this.queueGroups

              // console.log(this.queueGroups)
              // console.log(this.queues)

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

}

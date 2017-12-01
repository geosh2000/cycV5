import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-queues',
  templateUrl: './queues.component.html',
  styles: []
})
export class QueuesComponent implements OnInit {

  loading:boolean = false
  loadedBlock:any = {}
  luBlock:any = {}
  data:Object = {}
  agents:Object
  queues:Object
  deps:Object
  lu:string

  loop:boolean = false
  loopTime:number = 5000

  searchBlock:string = "956"
  waitDisplay:boolean = false
  searchedBlock:string

  blocks = [
            "RealTimeDO.RTRiassunto",
            "RealTimeDO.RTCallsBeingProc",
            "RealtimeDO.RTAgentsLoggedIn",
            "RealTimeDO.WallRiassunto",
            "RealTimeDO.WallCallsBeingProc",
            "RealTimeDO.VisitorCallsProc",
            "RealTimeDO.VisitorTodaysOk",
            "RealTimeDO.VisitorTodaysKo",
            "RealTimeDO.RtLiveQueues",
            "RealTimeDO.RtLiveCalls",
            "RealTimeDO.RtLiveAgents",
            "RealTimeDO.RtLIveStatus",
            // "RealTimeDO.RtAgentsRaw",
            "RealtimeDO.RtCallsRaw"
        ]


  constructor( public _api: ApiService ) {

    for( let block of this.blocks ){
      this.loadedBlock[block] = false
      this.luBlock[block] = null
    }

    this.getInitials()
  }

  getInitials(){
    this.getAgents()
    this.getQueues()
    this.getDeps()

    setTimeout( () => this.getInitials(), 300000 )
  }

  test(){
    this._api.testGet().subscribe( res => console.log(res))
  }

  getAll(){
      this.getRtCalls( this.blocks )
  }

  getRtCalls( block ){

    this.loading = true

    this._api.restfulPost( block, 'Queuemetrics/rtMonitor' )
            .subscribe( res => {
              // console.log( res )

              this.loading = false
              let data = res.data

              for(let item in data){
                // console.log(item, data[item]['tipo'], data[item])
                this.data[data[item]['tipo']] = this.parseJson( data[item]['json'] )
                this.loadedBlock[data[item]['tipo']] = true
                this.luBlock[data[item]['tipo']] = data[item]['Last_update']
              }

              this.getAgents()
              if(this.loop){
                setTimeout( () => this.getRtCalls( block ), this.loopTime )
              }

              console.log( this.data )

              this.searchedBlock = block
            }, err => {
              console.log("ERROR", err)
              this.loading = false

              if(this.loop){
                setTimeout( () => this.getRtCalls( block ), this.loopTime )
              }
            })
  }

  parseJson( data ){
    let json = data.replace( /(?:u')+/gmu, "'" ).replace( /(?:&nbsp;)+/gmu, "" )
    let result = JSON.parse( JSON.stringify(eval("(" + json + ")")) )
    delete result.result

    let final
    for( let item in result ){
      final = result[item]
    }

    let titles = {}
    for( let index in final[0] ){
      let titulo = final[0][index].replace( /(?: $)+/g, "" ).replace( /(?:^RT_)+/g, "" )
      if( titulo == "" ){
        titulo = 0
      }
      titles[index] = titulo
    }

    let resultado = {}
    for( let row in final ){
      resultado[row] = {}
      for( let index in final ){
        resultado[row][titles[index]] = final[row][index]
      }
    }

    delete resultado[0]

    return resultado
  }

  formatDate(datetime, format){
    if(datetime == null){
      return ""
    }

    let time = moment.tz(datetime, "America/Mexico_City")
    let cunTime = time.clone().tz("America/Bogota")

    return cunTime.format(format)
  }

  loopChg(){
    if(!this.loop){
      this.getRtCalls( this.blocks )
    }

    this.loop = !this.loop
  }

  ngOnInit() {
    this.getRtCalls( this.blocks )
  }

  getAgents(){

    this.loading = true

    this._api.restfulPost( ['Agents'], 'Queuemetrics/rtMonitor' )
            .subscribe( res => {

              this.loading = false
              let data = res.data

              let json = data[0].json.replace( /(?:u')+/gmu, "'" ).replace( /(?:&nbsp;)+/gmu, "" )
              let result = JSON.parse( JSON.stringify(eval("(" + json + ")")) )

              let agents = {}
              for( let agent of result ){
                let info = { name: agent.descr_agente.replace( /(?: \([0-9]*\))+/g, "" ).trim(), ext: agent.nome_agente.replace( /(?:^agent\/)+/g, "" ) }
                agents[agent.nome_agente] = info
              }

              this.agents = agents

            }, err => {
              console.log("ERROR", err)
              this.loading = false

            })

  }

  getQueues(){

    this.loading = true

    this._api.restfulPost( '', 'Queuemetrics/queues' )
            .subscribe( res => {

              this.loading = false
              let queues = res.data
              let result = {}
              for( let item of queues ){
                result[ item['queue'] ] = item
              }

              this.queues = result

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

}

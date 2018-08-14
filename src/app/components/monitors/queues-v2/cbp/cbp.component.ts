import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

import * as moment from 'moment-timezone';
import { InitService } from '../../../../services/service.index';

@Component({
  selector: 'app-cbp',
  templateUrl: './cbp.component.html',
  styles: [`
    .r90 {
      -webkit-transform: rotate(90deg);
      -moz-transform: rotate(90deg);
      -o-transform: rotate(90deg);
      -ms-transform: rotate(90deg);
      transform: rotate(90deg);
    }

    .r270 {
      -webkit-transform: rotate(270deg);
      -moz-transform: rotate(270deg);
      -o-transform: rotate(270deg);
      -ms-transform: rotate(270deg);
      transform: rotate(270deg);
    }

    .bg-outCC{
      background: #a83e8c
    }

    .bg-avail{
      background: -webkit-linear-gradient(top, #25be51 0%,#25be51 43%,#009e39 100%)
    }

    .bg-in{
      background: -webkit-linear-gradient(top, #e63e3c 0%,#e63e3c 43%,#d00905 100%)
    }

    .bg-aux{
      background:  -webkit-linear-gradient(top, #efd562 0%,#efd562 43%,#edc21a 100%)
    }

    .bg-outTry{
      background: -webkit-linear-gradient(top, #32c5ff 0%,#32c5ff 43%,#00acfc 100%)
    }

    .bg-out{
      background: -webkit-linear-gradient(top, #0069ea 0%,#0069ea 43%,#3b008e 100%)
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CbpComponent implements OnInit {

  @Input() setQueue:any = []
  @Input() queues:any
  @Input() monitor:boolean = false
  @Input() title:string = 'queue'
  @Input() data:any
  @Input() all:boolean = false
  @Input() lu:any
  @Input() waits:any
  @Input() deps:any
  @Input() pauses:any
  @Input() sla:any = []
  @Input() display:Object = {
    wait: false,
    detail: true,
    queue: true,
    sum: true,
    calls: true,
    byQueue: false
  }

  orderedDeps:any
  summary:Object = {
    'IN'          : 0,
    'OUT'         : 0,
    'Waiting'     : 0,
    'Online'      : 0,
    'Paused'      : 0,
    'Busy'        : 0,
    'Avail'       : 0
  }

  pauseLimits:Object = {
    3   : 1800,
    11  : 300,
    6   : 900,
    10  : 120,
    1   : 120,
    4   : 2700
  }

  calls:any
  callsAgent:any
  waitsOk:any
  loggedAgents:any
  showAll:boolean = false

  slaInfo:Object = {
    total: 0,
    sla20: 0,
    sla30: 0
  }



  constructor( private _init:InitService ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if( this.data && this.setQueue ){
      this.build( this.data )
    }
  }

  build( data ){
    if( !this.showAll ){
      this.showAll = (Object.keys(data).length > 0) ? true : false
      if(!this.showAll) return false
    }

    //SLA
    this.slaInfo = {
      total: 0,
      sla20: 0,
      sla30: 0
    }

    // console.log( this.setQueue )
    for( let q of this.setQueue ){
      let index = this.sla.map(function(e) { return e.queue; }).indexOf(q);
      this.slaInfo['total'] += this.sla[index] ? parseInt(this.sla[index]['calls']) : 0
      this.slaInfo['sla20'] += this.sla[index] ? parseInt(this.sla[index]['sla20']) : 0
      this.slaInfo['sla30'] += this.sla[index] ? parseInt(this.sla[index]['sla30']) : 0

      // console.log(q, index)
      // console.log(this.sla)
      // console.log(this.slaInfo)
    }

    // console.log(this.queues)
    let calls = {}
    let callsAgent = {}

    // AGENTS
    this.loggedAgents = this.agentsLogged( data )
    this.waitsInQ()

    // console.log(this.slaInfo)
    // console.log(this.sla)
  }

  printQueue( queue ){
    if( this.queues ){
      return this.queues[queue] ? this.queues[queue].Cola : queue
    }else{
      return queue
    }
  }

  waitsInQ(){
    this.waitsOk = []
    this.summary['Waiting']   = 0

    for(let w of this.waits){
      if( this.setQueue.indexOf( w['c_queue'] ) >= 0 ){
        this.summary['Waiting']++
        this.waitsOk.push(w)
      }

    }
  }

  agentsLogged( data ){

    let agents = {}

    this.summary['Online'] = 0
    this.summary['Paused'] = 0
    this.summary['Busy'] = 0
    this.summary['tt'] = 0
    this.summary['Avail'] = 0
    this.summary['IN']  = 0
    this.summary['OUT']  = 0

    for(let agent in data){
      let agentName:string
      agentName = data[agent]['name'] ? data[agent]['name'] : agent
      data[agent]['qs'] = data[agent]['queue'].split(":")
      agents[ agentName ] = data[agent]
    }

    // console.log(agents)

    this.orderAgents(agents)

    // console.log(agents)
    // console.log(this.queues )
    for( let item in agents ){
      if( this.queueBelong( agents[item]['qs'], this.setQueue ) ){
        this.summary['Online']++

        if( agents[item]['c_answered'] ){
          this.summary['Busy']++

          if( this.setQueue.length > 1){
            if( this.queueBelong( this.setQueue, [agents[item]['c_queue']] ) ){
              if( this.queues[agents[item]['c_queue']] && this.queues[agents[item]['c_queue']]['direction'] != '1' ){
                this.summary['OUT']++
              }else{
                this.summary['IN']++
                this.summary['tt'] += parseInt(moment().format('X')) - parseInt(agents[item]['c_answered'])
              }
            }


          }else{
            if( agents[item]['c_queue'] == this.setQueue[0] ){
              if( this.queues[agents[item]['c_queue']] && this.queues[agents[item]['c_queue']]['direction'] != '1' ){
                this.summary['OUT']++
              }else{
                this.summary['IN']++
                this.summary['tt'] += parseInt(moment().format('X')) - parseInt(agents[item]['c_answered'])
              }
            }
          }

        }else{
          if( agents[item]['curPauseCode'] != "" ){
            this.summary['Paused']++
          }else{
            this.summary['Avail']++
          }
        }
      }
    }

    // console.log(agents)
    return agents
  }

  queueBelong( obj, arr ){
    for(let q of arr){
      if( obj.indexOf( q ) >= 0){
        return true
      }
    }

    return false
  }

  orderAgents( data ){
    let deps = {}

    for(let agent in data){
      let depName = this.printDep( agent )
      if( depName.includes("PDV") ){
        if( depName.includes(" ") ){
          depName = `y${ depName }`
        }else{
          depName = `z${ depName }`
        }
      }

      if( !deps[ depName ] ){
        deps[ depName ] = {}
      }

      deps[ depName ][ agent ] = data[agent]
      deps[ depName ][ agent ]['code'] = agent
    }

    // console.log(deps)

    let result = this.orderKeys( deps )

    for(let i in result){
      let info = this.orderKeys( result[i] )
      result[i] = info
    }

    this.orderedDeps = result
    // console.log(this.orderedDeps)
  }

  orderKeys( obj ){
    let keys = []

    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        keys.push(k);
      }
    }

    keys.sort();

    let result = []
    for(let i of keys){
      result.push(obj[i])
    }

    return result
  }

  printDep( agent, tipo = 'dep' ){
    if( this.deps[agent] ){
      switch(tipo){
        case 'dep':
          return this.deps[agent].depCC
        case 'color':
          return this.deps[agent].color
      }
    }else{
      switch(tipo){
        case 'dep':
          return 'Unknown'
        case 'color':
          return null
      }
    }
  }

  inQueue( queue ){
    if( this.display['byQueue'] ){
      if( this.queues.indexOf( queue ) >= 0 ){
        return true
      }else{
        return false
      }
    }else{
      return true
    }
  }

  logQ(q, qs){
    if( qs.indexOf( q )>= 0 ){
      return true
    }else{
      return false
    }
  }

  colorHeader( agent, display=true ){

    let colorSheme = {
      aux: 'bg-aux text-dark',
      in: 'bg-in text-light',
      avail: 'bg-avail text-dark',
      outTry: 'bg-outTry text-dark',
      out: 'bg-out text-light'
    }

    if( this._init.preferences['colorProfile'] == '0' ){
      colorSheme['aux'] = 'bg-warning text-dark'
      colorSheme['in'] = 'bg-info text-light'
      colorSheme['avail'] = 'bg-light text-dark'
      colorSheme['outTry'] = 'bg-outCC text-light'
      colorSheme['out'] = 'bg-outCC text-light'
    }


    if(!display){
      return colorSheme['avail']
    }

    if( agent['c_answered'] ){
      if( agent['curPauseCode'] != '' ){
        return colorSheme['aux']
      }else{
        if( this.queues[agent['c_queue']] && this.queues[agent['c_queue']]['direction'] != '1' ){
          return agent['c_answered'] == '0' ? colorSheme['outTry'] : colorSheme['out']
        }else{
          return colorSheme['in']
        }
      }
    }

    if( agent['curPauseCode'] != '' ){
      return colorSheme['aux']
    }else{
      return colorSheme['avail']
    }


  }

  getDuration( datetime, format='hms', normal = false ){
    let now   = moment()
    let unix

    if( !normal ){
      unix  = moment.unix(datetime)
    }else{
      return moment.duration(datetime).asSeconds()
    }

    let result = moment.duration(now.diff(unix));

    let hours:any = Math.floor(result.asHours())
    let minutes:any = Math.floor(result.asMinutes()) - ( hours * 60 )
    let seconds:any = Math.floor(result.asSeconds()) - ( Math.floor(result.asMinutes()) * 60 )

    if( hours < 10 ){ hours = `0${ hours }` }
    if( minutes < 10 ){ minutes = `0${ minutes }` }
    if( seconds < 10 ){ seconds = `0${ seconds }` }

    switch(format){
      case 'hms':
        return `${ hours }:${ minutes }:${ seconds }`
      case 'h':
        return Math.floor(result.asHours())
      case 'm':
        return Math.floor(result.asMinutes())
      case 's':
        return Math.floor(result.asSeconds())
    }
  }

  printTime( time, format, unix=false){
    if(unix){
      return moment.unix(time).format(format)
    }else{
      return moment(time).format(format)
    }
  }



}

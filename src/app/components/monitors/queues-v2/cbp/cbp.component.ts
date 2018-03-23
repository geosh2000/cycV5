import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

import * as moment from 'moment-timezone';

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

    .bg-out{
      background: #a83e8c
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

  constructor() { }

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

    // console.log(this.queues)
    let calls = {}
    let callsAgent = {}

    // AGENTS
    this.loggedAgents = this.agentsLogged( data )
    this.waitsInQ()
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

    if(!display){
      return 'bg-light text-dark'
    }

    if( agent['c_answered'] ){
      if( agent['curPauseCode'] != '' ){
        return 'bg-warning text-white'
      }else{
        if( this.queues[agent['c_queue']] && this.queues[agent['c_queue']]['direction'] != '1' ){
          return 'bg-out text-white'
        }else{
          return 'bg-info text-white'
        }
      }
    }

    if( agent['curPauseCode'] != '' ){
      return 'bg-warning text-black'
    }else{
      return 'bg-light text-black'
    }


  }

  getDuration( datetime, format='hms', normal = false ){
    let now   = moment()
    let unix

    if( !normal ){
      unix  = moment.unix(datetime)
    }else{
      return moment.duration(datetime, 'kk:mm:ss').asSeconds()
    }

    let result = moment.duration(now.diff(unix));

    let hours:any = parseInt(result.asHours())
    let minutes:any = parseInt(result.asMinutes()) - ( hours * 60 )
    let seconds:any = parseInt(result.asSeconds()) - ( parseInt(result.asMinutes()) * 60 )

    if( hours < 10 ){ hours = `0${ hours }` }
    if( minutes < 10 ){ minutes = `0${ minutes }` }
    if( seconds < 10 ){ seconds = `0${ seconds }` }

    switch(format){
      case 'hms':
        return `${ hours }:${ minutes }:${ seconds }`
      case 'h':
        return parseInt(result.asHours())
      case 'm':
        return parseInt(result.asMinutes())
      case 's':
        return parseInt(result.asSeconds())
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

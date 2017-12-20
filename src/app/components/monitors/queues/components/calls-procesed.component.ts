import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-calls-procesed',
  templateUrl: './calls-procesed.component.html',
  styles: []
})
export class CallsProcesedComponent implements OnInit {

  @Input() callsData:any
  @Input() setQueue:any = []
  @Input() waitDisplay:boolean = false
  @Input() sumDisplay:boolean = false
  @Input() detailDisplay:boolean = false
  @Input() queueDisplay:boolean = false
  @Input() callsDisplay:boolean = true
  @Input() deps:any
  @Input() title:string = 'queue'
  @Input() queueInfo:any

  summary:Object = {
    'IN'          : 0,
    'OUT'         : 0,
    'Waiting'     : 0,
    'Online'      : 0,
    'Paused'      : 0,
    'Busy'        : 0,
    'Avail'       : 0
  }

  orderedDeps:any

  pauseLimits:Object = {
    'Comida'                : 1800,
    'Pausa No Productiva'   : 300,
    'Charla con supervisor' : 900,
    'ACW'                   : 120,
    'Mesa de Hospitalidad'  : 2700
  }

  calls:any
  callsAgent:any
  loggedAgents:any


  dateFields = [
                'entered',
                'answered',
                'tstStart'
                ]

  constructor() {}

  ngOnInit() {


  }

  ngOnChanges(changes: SimpleChanges) {

    if(this.callsData){
      this.build( this.callsData )
    }

  }

  build( data ){
    let calls = {}
    let callsAgent = {}

    // AGENTS
    this.loggedAgents = this.agentsLogged( data['AgentsLogged'] )

    this.summary['IN']  = 0
    this.summary['OUT']  = 0
    this.summary['Waiting']   = 0

    // console.log(data.Raw)

    // OLD VER
    for( let item in data.Raw ){

      // Assign to agent
      if( ( calls[data.Raw[item]['caller']] && calls[data.Raw[item]['caller']].entered < data.Raw[item].entered ) || !calls[data.Raw[item]['caller']] ){

      let tmpArray = data.Raw[item]

      for( let field of this.dateFields ){
        tmpArray[field + '_time'] = this.formatDate(tmpArray[field], 'kk:mm:ss')
      }

      calls[data.Raw[item]['caller']] = tmpArray

      }

      //Current VER
      let tmpArray = data.Raw[item]

      for( let field of this.dateFields ){
        tmpArray[field + '_time'] = this.formatDate(tmpArray[field], 'kk:mm:ss')
      }

      let tmpEnter = {}
      tmpEnter['new'] = parseInt(tmpArray.entered)

      if( callsAgent[data.Raw[item]['agent']] ){
        tmpEnter['old'] = parseInt(callsAgent[data.Raw[item]['agent']].entered)
      }

      // console.log(data.Raw[item]['agent'], tmpArray.caller, tmpArray.entered)
      if( ( callsAgent[data.Raw[item]['agent']] && tmpEnter['old'] < tmpEnter['new'] ) || !callsAgent[data.Raw[item]['agent']] ){
        callsAgent[data.Raw[item]['agent']] = tmpArray
      }

    }

    for( let item in calls ){
      //summary data
      if( this.queueWait( calls[item]['queue'], this.setQueue ) ){
        if( calls[item]['answered'] != '0' ){
          if( this.queueInfo[calls[item]['queue']] && this.queueInfo[calls[item]['queue']]['direction'] != '1' ){
            this.summary['OUT']++
          }else{
            this.summary['IN']++
          }
        }else{
          this.summary['Waiting']++
        }
      }
    }

    this.calls = calls
    this.callsAgent = callsAgent
    // console.log(this.callsAgent)
  }

  formatDate(datetime, format){
    if(datetime == null){
      return ""
    }

    let unix = moment.unix(datetime)

    return unix.format(format)

    // let time = moment.tz(unix.format('YYYY-MM-DD kk:mm:ss'), "America/Mexico_City")
    // let cunTime = time.clone().tz("America/Bogota")
    //
    // return cunTime.format(format)
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

  getInfo( asesor, param ){

    if( this.callsAgent && this.callsAgent[asesor] ){
      return this.callsAgent[asesor][param];
    }

    // for( let i in this.calls ){
    //     if (this.calls[i].agent == asesor) {
    //       // console.log(`array: ${this.calls[i].agent}`, `asesor: ${asesor}`)
    //         return this.calls[i][param];
    //     }
    // }


    return null;
  }

  agentsLogged( data ){

    let agents = {}

    this.summary['Online'] = 0
    this.summary['Paused'] = 0
    this.summary['Busy'] = 0
    this.summary['Avail'] = 0

    for(let agent in data){
      let agentName:string
      if( !/\//g.test( data[agent]['Agent'] ) ){
        let ext = data[agent]['Agent'].match( /(?!\()([0-9]*)(?=\))/g )
        agentName = "agent/" + ext[0]
      }else{
        agentName = data[agent]['Agent']
      }

      data[agent]['qs'] = data[agent]['Queue(s):'].split(", ")

      agents[ agentName ] = data[agent]
    }

    this.orderAgents(agents)

    for( let item in agents ){
      if( this.queueBelong( agents[item]['qs'], this.setQueue ) ){
        this.summary['Online']++

        if( this.getInfo( item, 'caller' ) ){
          this.summary['Busy']++
        }else{
          if( agents[item]['On pause'] != "-" ){
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

  orderAgents( data ){
    let deps = {}

    for(let agent in data){
      if( this.callsData.Agents[agent] ){
        let depName = this.printDep( this.callsData.Agents[agent].name )

        if( depName == 'PDV' ){ depName = `z${ depName }` }

        if( !deps[ depName ] ){
          deps[ depName ] = {}
        }
        deps[ depName ][ this.callsData.Agents[agent].name ] = data[agent]
        deps[ depName ][ this.callsData.Agents[agent].name ]['code'] = agent
      }
    }

    let result = this.orderKeys( deps )

    for(let i in result){
      let info = this.orderKeys( result[i] )
      result[i] = info
    }

    this.orderedDeps = result
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

  colorHeader( agent, queue='', display=false ){

    if(display){
      return 'bg-light text-dark'
    }

    if( this.getInfo( agent, 'caller' ) ){
      if( this.loggedAgents[ agent ]['On pause'] != '-' ){
        return 'bg-warning text-white'
      }else{
        if( this.queueInfo[queue] && this.queueInfo[queue]['direction'] != '1' ){
          return 'bg-primary text-white'
        }else{
          return 'bg-info text-white'
        }
      }
    }

    if( this.loggedAgents[ agent ]['On pause'] != '-' ){
      return 'bg-warning text-black'
    }else{
      return 'bg-light text-black'
    }


  }

  getPause( agent, result ){
    switch( result ){
      case 'pause':
        let pause = this.loggedAgents[agent]['On pause'].replace(  /^(?:[0-9:]*)[ ]/g, "" )
        if( pause.length > 2 ){
          return pause
        }else{
          return 'Unknown'
        }
      case 'time':
        let time        = this.loggedAgents[agent]['On pause'].match(  /^(?:[0-9:]*)/g, "" )
        let now         = moment()
        let timePaused  = moment.tz( `${now.format('YYYY-MM-DD')} ${ time[0] }:00`, 'America/Mexico_City')
        let timeCun     = timePaused.clone().tz('America/Bogota')
        return this.getDuration( timeCun.unix() )
    }
  }

  printQueue( queue ){
    if( this.callsData.Queues[queue] ){
      return this.callsData.Queues[queue].Cola
    }else{
      return queue
    }
  }

  printDep( agent, tipo = 'dep' ){
    if( this.deps[agent] ){
      switch(tipo){
        case 'dep':
          return this.deps[agent].Departamento
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

  queueBelong( obj, arr ){
    for(let q of arr){
      if( obj.indexOf( this.printQueue( q ) ) >= 0){
        return true
      }
    }

    return false
  }

  queueWait( obj, arr ){
    for(let q of arr){
      if( obj== q ){
        return true
      }
    }

    return false
  }




}

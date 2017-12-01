import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-calls-procesed',
  templateUrl: './calls-procesed.component.html',
  styles: []
})
export class CallsProcesedComponent implements OnInit {

  @Input() callsData:any
  @Input() setQueue:number = 956
  @Input() waitDisplay:boolean = false
  @Input() deps:any

  orderedDeps:any

  calls:any
  loggedAgents:any


  dateFields = [
                'entered',
                'answered',
                'tstStart'
                ]

  constructor() { }

  ngOnInit() {


  }

  ngOnChanges(changes: SimpleChanges) {

    if(this.callsData){
      this.build( this.callsData )
    }

  }

  build( data ){

    let calls = {}

    // AGENTS
    this.loggedAgents = this.agentsLogged( data['AgentsLogged'] )

    // RAW CALLS
    for( let item in data.Raw ){

      if( ( calls[data.Raw[item]['caller']] && calls[data.Raw[item]['caller']].entered < data.Raw[item].entered ) || !calls[data.Raw[item]['caller']] ){
        calls[data.Raw[item]['caller']] = data.Raw[item]

        for( let field of this.dateFields ){
          calls[data.Raw[item]['caller']][field + '_time'] = this.formatDate(calls[data.Raw[item]['caller']][field], 'kk:mm:ss')
        }
      }

    }

    this.calls = calls
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

  getDuration( datetime, format='hms' ){
    let now   = moment()
    let unix  = moment.unix(datetime)

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
    for( let i in this.calls ){
        if (this.calls[i].agent == asesor) {
          // console.log(`array: ${this.calls[i].agent}`, `asesor: ${asesor}`)
            return this.calls[i][param];
        }
    }
    return null;
  }

  agentsLogged( data ){

    let agents = {}

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

  colorHeader( agent ){

    if( this.getInfo( agent, 'caller' ) ){
      if( this.loggedAgents[ agent ]['On pause'] != '-' ){
        return 'bg-warning text-white'
      }else{
        return 'bg-info text-black'
      }
    }

    if( this.loggedAgents[ agent ]['On pause'] != '-' ){
      return 'bg-warning text-black'
    }else{
      return 'bg-success text-white'
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




}

import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';


import * as moment from 'moment-timezone';
import { ApiService } from '../../../../services/service.index';

@Component({
  selector: 'app-call-block',
  templateUrl: './call-block.component.html',
  styles: [`/* Flash class and keyframe animation */
  .flashit{
    color:#f2f;
  	-webkit-animation: flash linear 1s infinite;
  	animation: flash linear 1s infinite;
  }
  @-webkit-keyframes flash {
  	0% { opacity: 1; }
  	50% { opacity: .1; }
  	100% { opacity: 1; }
  }
  @keyframes flash {
  	0% { opacity: 1; }
  	50% { opacity: .1; }
  	100% { opacity: 1; }
  }`]
})
export class CallBlockComponent implements OnInit, OnChanges, OnDestroy {

  @Input() dispo:any = 1
  @Input() data:any = []
  @Input() qData:any = []
  @Input() display:Object = {}
  @Input() params:Object = {
    active: true,
    bySkill: false,
    skill: 0,
    qs: []
  }
  @Input() countrySelected:any = ''
  @Input() qList:any = []
  @Input() qsDisplay:boolean
  @Input() ahtLimits:Object = {}

  selectedQNames:Object = {}
  selectedSkill:any

  selectBySkill:boolean = false

  title:any = ''

  waits:any = []
  agents:any = []

  sumAll:any = {}
  summary:Object = {}

  loading:Object = {}

  selectOptions:Select2Options = {
    multiple: true,
  }

  timeout:any
  timerCount = 10
  timer:Object = {
    success: 60,
    error: 10
  }

  constructor( private _api:ApiService ) {}

  ngOnInit() {
    this.timerCount = 2
    this.startTimer()
  }

  ngOnChanges( changes: SimpleChanges ){
    this.buildCalls()
    this.changeSkill( this.params['skill'] )
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  buildCalls(){
    // console.log(this.params['qs'])
    let waits = [], agents = []
    let sum = {
      in: 0,
      out: 0,
      pause: 0,
      avail: 0,
      busy: 0,
      online: 0,
      ttIn: 0,
      ttOut: 0
    }
    for( let item of this.qData ){
      if( (this.params['qs'].indexOf(item['waitQ']) > -1 || this.params['qs'].length == 0) && !item['Queue'] && item['waitQ'] && item['caller']){
        if( item['agente'].match(/^wait/g) ){
          waits.push(item)
        }
      }else{
        if( item['Queue'] ){
          agents.push(item)

          // ONLY MEMBERS OF SELECTED Qs
          if( this.isMember(item['qs']) || this.params['qs'].length == 0 ){
            sum['online']++

            // ONLY CALLS IN SELECTED Q's
            if( this.isMember([item['waitQ']]) || this.params['qs'].length == 0 ){
              if( item['caller'] ){
                if( item['direction'] == '1' ){
                  sum['in']++
                  sum['ttIn'] += parseInt( this.getDuration( item['lastTst'], 'm' ) )
                }else{
                  sum['out']++
                  sum['ttOut'] += parseInt( this.getDuration( item['lastTst'], 'm' ) )
                }

                sum['busy']++
              }else{
                if( !item['Pausa'] ){
                  sum['avail']++
                }
              }
            }

            if( item['Pausa'] ){
              sum['pause']++
            }
          }
        }
      }
    }

    this.agents = agents
    this.waits = waits
    this.summary = sum
  }

  selectedVal( val ){
    console.log( 'selVal')
    if( !this.params['bySkill'] ){
      this.params['qs'] = val.value
      this.timerCount = 2
    }
  }

  changeSkill( val ){
    // console.log( val )
    for( let skill of this.qList ){
      if( skill['skill'] == val ){
        this.params['qs'] = skill['qs']
        this.selectedQNames = skill['nameQs']
        this.timerCount = 2
        return true
      }
    }
  }

  getDuration( datetime, format='hms', normal = false ):any{
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

  unitToTime( val, unit, format ){
    let result = moment.duration(val, unit)

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

  isMember( qs ){

    for( let item of this.params['qs'] ){
      if( qs.indexOf( item ) > -1 ){
        return true
      }
    }

    return false
  }

  getSummary( flag = false ){

    this.loading['sum'] = true

    this._api.restfulPut( this.params['qs'],'Queuemetrics/summaryRT/' + this.countrySelected )
              .subscribe( res => {

                this.loading['sum'] = false

                this.sumAll = res['data']

                this.timerCount = this.timer['success']
                if( !flag ){
                  this.startTimer()
                }

              }, err => {

                this.loading['sum'] = false

                this.timerCount = this.timer['success']
                if( !flag ){
                  this.startTimer()
                }

                console.log('ERROR', err)

                let error = err.error
                console.error(err.statusText, error.msg)

              })
  }

  startTimer(){
    if( this.timerCount == 0 ){
      this.getSummary()
    }else{
      this.timerCount --
      this.timeout = setTimeout( () => this.startTimer(), 1000 )
    }

  }


}

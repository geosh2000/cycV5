import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as moment from 'moment-timezone';
import { ApiService } from '../../../../services/service.index';

@Component({
  selector: 'app-call-block',
  templateUrl: './call-block.component.html',
  styles: []
})
export class CallBlockComponent implements OnInit, OnChanges, OnDestroy {

  @Input() dispo:any = 1
  @Input() data:any = []
  @Input() qData:any = []
  @Input() display:Object = {}
  @Input() countrySelected:any = ''

  title:any = ''

  waits:any = []
  agents:any = []

  selectedQs:any = []
  sumAll:any = {}
  summary:Object = {}

  loading:Object = {}

  selectOptions:Select2Options = {
    multiple: true,
  }

  timeout:any
  timerCount = 60
  timer:Object = {
    success: 60,
    error: 10
  }

  constructor( private _api:ApiService ) { }

  ngOnInit() {
    this.timerCount = 2
    this.startTimer()
  }

  ngOnChanges( changes: SimpleChanges ){
    this.buildCalls()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  buildCalls(){
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
      if( (this.selectedQs.indexOf(item['waitQ']) > -1 || this.selectedQs.length == 0) && !item['Queue'] && item['waitQ'] && item['caller'] ){
        waits.push(item)
      }else{
        if( item['Queue'] ){
          agents.push(item)

          // ONLY MEMBERS OF SELECTED Qs
          if( this.isMember(item['qs']) || this.selectedQs.length == 0 ){
            sum['online']++

            // ONLY CALLS IN SELECTED Q's
            if( this.isMember([item['waitQ']]) || this.selectedQs.length == 0 ){
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
    this.selectedQs = val.value
    this.timerCount = 2
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

    for( let item of this.selectedQs ){
      if( qs.indexOf( item ) > -1 ){
        return true
      }
    }

    return false
  }

  getSummary(){

    this.loading['sum'] = true

    this._api.restfulPut( this.selectedQs,'Queuemetrics/summaryRT/' + this.countrySelected )
              .subscribe( res => {

                this.loading['sum'] = false

                this.sumAll = res['data']

                this.timerCount = this.timer['success']
                this.startTimer()

              }, err => {

                this.loading['sum'] = false

                this.timerCount = this.timer['success']
                this.startTimer()

                console.log('ERROR', err)

                let error = err.json()
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

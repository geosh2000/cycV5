import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment-timezone';
import { InitService } from '../../../../services/service.index';

@Component({
  selector: 'app-call-card-sm',
  templateUrl: './call-card-sm.component.html',
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
  }

  /* Flash class and keyframe animation */
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
export class CallCardSmComponent implements OnInit {

  @Input() item:Object = {}
  @Input() queue:any = []
  @Input() selectedQNames:Object = {}
  @Input() qsDisplay:boolean
  @Input() ahtLimits:Object = {}
  @Input() countrySelected:any = ''

  constructor( private _init: InitService) { }

  ngOnInit() {
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

  bgCardColor(item){

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

    if( item['caller'] ){
      if( item['Pausa'] ){
        return colorSheme['aux']
      }else{
        if( item['direction'] == '2' ){
          if( parseInt(item['answeredTst']) == 0 ){
            return colorSheme['outTry']
          }else{
            return colorSheme['out']
          }
        }else{
          return colorSheme['in']
        }
      }
    }

    if( item['Pausa'] ){
      return colorSheme['aux']
    }

    return colorSheme['avail']

  }

  tsfName( name ){
    return name.replace(/[\/\s]/g, '<br>')
  }

  isMember( qs ){

    for( let item of this.queue ){
      if( qs.indexOf( item ) > -1 ){
        return true
      }
    }

    return false
  }

  colorQ( item, q ){
    if( item['qs'].indexOf(q)>=0 ){

      if( this.selectedQNames[q] == item['Q'] ){
        return 'badge-primary'
      }else{
        return 'badge-success'
      }
    }else{
      return 'badge-light border border-info'
    }
  }

  colorTime( item ){
    if(item['direction'] != '2' && !item['Pausa']){
      if( this.getDuration( item['lastTst'], 's' ) > parseInt(this.ahtLimits[item['waitQ']]) ){
        return true
      }

      return false
    }

    if( item['direction'] != '2' && item['Pausa'] ){
      let limit = 0
      switch( item['Pausa'] ){
        case 'Pausa No Productiva':
          limit = 300
          break
        case 'ACW':
          limit = 120
          break
        case 'Comida':
          limit = 1800
          break
        case 'Mesa de Hospitalidad':
        case 'Charla con Supervisor':
        case 'Briefing':
        case 'Trabajo en Piso':
          limit = 3600
          break
        default:
          limit = 1000000000
      }

      let tst =  this.getDuration( item['lastTst'] > item['origPauseTst'] ? item['lastTst'] : item['origPauseTst'], 's' )

      if( tst > limit ){
        return true
      }

      return false
    }

  }

  secToTime( seconds ){
    if( !seconds ){
      return false
    }

    return moment().startOf('day')
      .seconds(seconds)
      .format('H:mm:ss');
  }

}

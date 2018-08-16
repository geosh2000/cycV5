import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styles: []
})
export class CountdownComponent implements OnInit {

  @Input() small:boolean = false

  counter:any
  target:any
  thisDay:any

  constructor( ) {
    this.setTarget()
    this.thisDay = parseInt(moment().format('DD'))
  }

  setTarget(){
    this.target = moment.tz(moment().format('YYYY-MM-DD HH:mm:ss'), 'America/Bogota').tz('America/Mexico_city').add(1, 'months').format('YYYY-MM-01 00:00:00')
  }

  formatTime( type ){
    this.setTarget()
    let leftTime = parseFloat(moment.tz(this.target, 'America/Mexico_city').format('X')) - parseFloat(moment().format('X'))
    let seconds = moment.duration( leftTime, 'seconds' )
    seconds = moment.duration(seconds.asSeconds() - 1, 'seconds');

    switch(type){
      case 'dias':
        return seconds.days()
      case 'horas':
        return new DecimalPipe('es-MX').transform(seconds.hours(), '2.0-0')
      case 'minutos':
        return new DecimalPipe('es-MX').transform(seconds.minutes(), '2.0-0')
      case 'segundos':
        return new DecimalPipe('es-MX').transform(seconds.seconds(), '2.0-0')
    }
  }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-countdown-meta',
  templateUrl: './countdown-meta.component.html',
  styles: []
})
export class CountdownMetaComponent implements OnInit {

  target:any
  left:any

  constructor( ) {
    this.initTime()
  }

  setTarget(){
    this.target = moment.tz(moment().format('YYYY-MM-DD'), 'America/Bogota').tz('America/Mexico_city').add(1, 'months').format('YYYY-MM-01 00:00:00')
  }

  initTime(){
    this.formatTime()
    setTimeout( () =>  this.initTime(), 600000 )
  }

  ngOnInit() {
  }

  formatTime(){
    this.setTarget()
    let leftTime = parseFloat(moment.tz(this.target, 'America/Mexico_city').format('X')) - parseFloat(moment().format('X'))
    let seconds = moment.duration( leftTime, 'seconds' )
    seconds = moment.duration(seconds.asSeconds() - 1, 'seconds');

    this.left = seconds.days()
  }

}

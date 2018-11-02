import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment-timezone';
import { CallStatisticsComponent } from './call-statistics.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-multiple-call-stats',
  templateUrl: './multiple-call-stats.component.html',
  styles: []
})
export class MultipleCallStatsComponent implements OnInit, OnDestroy {

  @ViewChild('monA') _monA:CallStatisticsComponent
  @ViewChild('monB') _monB:CallStatisticsComponent
  @ViewChild('monC') _monC:CallStatisticsComponent
  @ViewChild('monD') _monD:CallStatisticsComponent

  defaultMon:Object = {
    a: 35,
    b: 7,
    c: 55,
    d: 73
  }
  monitor:Object = {
    a: 35,
    b: 7,
    c: 55,
    d: 73
  }

  reloadFlag = moment()
  timeCount:number = 600
  timeout:any

  constructor( private titleService: Title, private activatedRoute:ActivatedRoute ) {

    this.activatedRoute.params.subscribe( params => {
      this.monitor['a'] = params.a ? params.a : this.defaultMon['a']
      this.monitor['b'] = params.b ? params.b : this.defaultMon['b']
      this.monitor['c'] = params.c ? params.c : this.defaultMon['c']
      this.monitor['d'] = params.d ? params.d : this.defaultMon['d']
    })

  }

  ngOnInit() {
    this.timerLoad()
    this.titleService.setTitle('CyC - Detalle Asesores');
  }

  ngOnDestroy() {
    clearTimeout(this.timeout)
  }

  timerLoad( pause = false ){

    if( this.timeCount == 0 ){
      this.chgFlag()
      this.timeCount = 600
    }else{
      if( this.timeCount > 0){
        this.timeCount--
      }
    }

    this.timeout = setTimeout( () => {
      this.timerLoad()
      }, 1000 )

  }

  chgFlag(){
    let td = moment().tz('America/Mexico_city').format('YYYY-MM-DD')

    this._monA.inicio = td
    this._monA.fin = td
    this._monB.inicio = td
    this._monB.fin = td
    this._monC.inicio = td
    this._monC.fin = td
    this._monD.inicio = td
    this._monD.fin = td
    this._monA.timeCount = 1
    this._monB.timeCount = 2
    this._monC.timeCount = 3
    this._monD.timeCount = 4

  }

}

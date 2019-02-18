import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment-timezone';
import { CallStatisticsComponent } from '../calls/call-statistics.component';
import { Title } from '@angular/platform-browser';
import { QueuesV3Component } from '../queues-v3/queues-v3.component';

@Component({
  selector: 'app-calls-v2',
  templateUrl: './calls-v2.component.html',
  styles: []
})
export class CallsV2Component implements OnInit, OnDestroy {

  @ViewChild('monA') _monA:CallStatisticsComponent
  @ViewChild(QueuesV3Component) _qM:QueuesV3Component

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

  countrySelected = 'MX'
  viewParams:Object = {
    small: true,
    qs: false,
    displays: {
      v1: { active: true,  detail: false, bigDetail: true, waits: false, bySkill: true, skill: '35_1', qs: [] },
      v2: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
      v3: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
      v4: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] },
      v5: { active: false, detail: true, bigDetail: false, waits: true, bySkill: false, skill: '', qs: [] }
    }
  }

  skillSelected:any = 35

  constructor( private titleService: Title, private activatedRoute:ActivatedRoute ) {
    this.activatedRoute.params.subscribe( params => {
      this.skillSelected = params.a ? params.a : this.skillSelected
      this.viewParams['displays']['v1']['skill'] = `${this.skillSelected}_1`
      if( this._qM ){
        this._qM['_callb'].params['skill']=`${this.skillSelected}_1`
        this._qM['_callb'].changeSkill(`${this.skillSelected}_1`)
      }
    })

 }

  ngOnInit() {
    this.titleService.setTitle('CyC - Detalle Asesores');
  }

  ngOnDestroy() {
    clearTimeout(this.timeout)
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

  emitSkill( val ){
    this.skillSelected = val
  }

}

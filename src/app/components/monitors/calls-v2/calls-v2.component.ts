import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment-timezone';
import { CallStatisticsComponent } from '../calls/call-statistics.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-calls-v2',
  templateUrl: './calls-v2.component.html',
  styles: []
})
export class CallsV2Component implements OnInit, OnDestroy {

  @ViewChild('monA') _monA:CallStatisticsComponent

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
    })

  }

  ngOnInit() {
    // this.timerLoad()
    this.titleService.setTitle('CyC - Detalle Asesores');
  }

  ngOnDestroy() {
    clearTimeout(this.timeout)
  }

}

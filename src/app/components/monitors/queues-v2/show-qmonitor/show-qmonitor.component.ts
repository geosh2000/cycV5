import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { ZonaHorariaService } from '../../../../services/service.index';

import * as moment from 'moment-timezone';
declare var jQuery:any;

@Component({
  selector: 'app-show-qmonitor',
  templateUrl: './show-qmonitor.component.html',
  styles: []
})
export class ShowQMonitorComponent implements OnInit, OnChanges {

  @Input() data:Object = {
    data: '',
    queueGroups: '',
    skillGroup: '',
    skillSelected: '',
    queues: '',
    pauses: '',
    deps: '',
    display: '',
    waits: '',
    slaData: '',
    ordG: '',
    lu: ''
  }
  @Input() display:boolean = true

  constructor( private _zh:ZonaHorariaService ) { }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  formatDate(datetime, format){
    if(datetime == null){
      return ''
    }

    return moment.tz(datetime, 'America/Mexico_City').tz( this._zh.zone ).format(format)
  }

}

import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pdv-monitor-horarios-detail',
  templateUrl: './pdv-monitor-horarios-detail.component.html',
  styles: []
})
export class PdvMonitorHorariosDetailComponent implements OnInit {

  @Input() detail:any = []

  constructor() { }

  ngOnInit() {
  }

  formatDate(t,f){
    return moment(t).format(f)
  }

}

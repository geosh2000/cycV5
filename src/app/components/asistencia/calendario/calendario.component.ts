import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styles: []
})
export class CalendarioComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'default'

  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  dataOK:any
  dataCal:any

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager, vcr: ViewContainerRef ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

  }

  ngOnInit() {
     this.calendarOptions = {
        editable: true,
        eventLimit: false,
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listMonth'
        },
        events: this.dataOK
      };
  }

  viewCal( event ){

    let dates = {
      inicio: event.view.intervalStart.subtract(7,'days').format('YYYY-MM-DD'),
      fin: event.view.intervalEnd.add(7,'days').format('YYYY-MM-DD')
    }

    console.log( dates )


  }

}

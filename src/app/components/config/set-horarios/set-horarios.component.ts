import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-set-horarios',
  templateUrl: './set-horarios.component.html',
  styles: []
})
export class SetHorariosComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent
  searchStart:any
  searchEnd:any

  selectedAsesores:any = []
  filterExpanded:boolean = false

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'schedules_change'

  loading:Object = {}

  constructor(
                private _api:ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService
                ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
          }
        })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Incentivos');
  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }


}

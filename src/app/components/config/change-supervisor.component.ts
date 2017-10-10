import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter,ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import {ToastsManager} from 'ng2-toastr/ng2-toastr';

declare var jQuery:any;


import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-change-supervisor',
  templateUrl: './change-supervisor.component.html',
  styles: []
})
export class ChangeSupervisorComponent implements OnInit {

  showContents:boolean = false
  mainCredential:string = 'hc_cambios_aprobacion'
  currentUser:any

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  dateChangeVar:string

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                private route:Router,
                private _init:InitService,
                public toastr: ToastsManager,
                public vcr: ViewContainerRef
                ) {

      this.toastr.setRootViewContainerRef(vcr)

      this.currentUser = this._init.getUserInfo()
      this.showContents = this._init.checkCredential( this.mainCredential, true )

  }

  ngOnInit() {
  }

  dateChange( start ){

    this.dateChangeVar = start.format("YYYY-MM-DD")
    jQuery('#datepicker').val(`${ this.dateChangeVar }`)

  }

}

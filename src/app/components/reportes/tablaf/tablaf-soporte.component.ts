import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';
import { SoporteMxComponent } from './soporte-mx/soporte-mx.component';

import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-tablaf-soporte',
  templateUrl: './tablaf-soporte.component.html',
  styles: []
})
export class TablafSoporteComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent
  @ViewChild( SoporteMxComponent ) public _soporte: SoporteMxComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'tablas_f'

  loading:Object = {}

  searchStart:any
  searchEnd:any
  skill:any = 4

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
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
    this.titleService.setTitle('CyC - Tabla F');
  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${start.format("DD MMM 'YY")} - ${end.format("DD MMM 'YY")}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  getData( ){
    this._soporte.getData( this.searchStart, this.searchEnd, this.skill )
  }

  download( title ){
    this._soporte.download( title )
  }

}

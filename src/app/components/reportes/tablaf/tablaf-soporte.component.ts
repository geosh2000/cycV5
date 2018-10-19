import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

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
  deps:any = []

  searchStart:any
  searchEnd:any
  skill:any = 4
  params:Object = {}

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
    this.getDeps()
  }

  dateChange( start, end ){

    this.searchStart = start.format('YYYY-MM-DD')
    this.searchEnd = end.format('YYYY-MM-DD')

    jQuery('#datepicker').val(`${start.format('DD MMM \'YY')} - ${end.format('DD MMM \'YY')}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  getData( ){
    this._soporte.getData( this.searchStart, this.searchEnd, this.skill, this.params )
  }

  download( title ){
    this._soporte.download( title )
  }


  getDeps(){
    this.loading['deps'] = true

    this._api.restfulGet( `0/1/`, 'Lists/fDepList' )
            .subscribe( res => {

              this.loading['deps'] = false

              this.deps = res['data']

            }, err => {
              console.log('ERROR', err)

              this.loading['deps'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)
            })
  }

  selectDep( index ){
    this.skill = this.deps[index.target.value]['id']
    this.params = this.deps[index.target.value]
  }

}

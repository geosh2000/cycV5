import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pya',
  templateUrl: './pya.component.html',
  styles: []
})
export class PyaComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'monitor_gtr'

  loading:Object = {}
  dateSearch:string

  dataSchedules:any
  asesorIndex:Object = {}

  constructor( public _api: ApiService,
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
          }
        })

    this.dateSearch = moment().format('YYYY-MM-DD')

    this.getSchedules()
  }

  ngOnInit() {
  }

  getSchedules(){
    this.loading['schedules'] = true

    this._api.restfulGet( this.dateSearch, 'Pya/horarios' )
            .subscribe( res => {

              this.loading['schedules'] = false

              let idIndex = {}

              for( let item in res.data ){
                idIndex[res.data[item].asesor] = item
              }

              this.dataSchedules              = res.data
              this.asesorIndex['schedules']   = idIndex


            }, err => {
              console.log("ERROR", err)

              this.loading['schedules'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  printTime( time, format ){

    if(time == null){
      return ''
    }

    let cunTime = moment.tz(time, 'America/Mexico_city').tz('America/Bogota')

    return cunTime.format( format )

  }

  timeProcess( start, end ){

    if( start == null || end == null ){
      return null
    }

    let first = parseInt(moment(start).format('x'))
    let last = parseInt(moment(end).format('x'))

    return last - first

  }


}

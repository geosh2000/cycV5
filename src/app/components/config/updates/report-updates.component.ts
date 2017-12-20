import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import { UploadFilesComponent } from '../../formularios/upload-files.component';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-report-updates',
  templateUrl: './report-updates.component.html',
  styles: []
})
export class ReportUpdatesComponent implements OnInit {

  @ViewChild( UploadFilesComponent ) _upl:UploadFilesComponent

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'upload_info'

  uplData:Object

  errLoading:Object   = {}
  errMsg:Object       = {}

  loading:Object      = {}
  upl:Object          = {
    ans: '',
    unans: ''
  }

  reports:any


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

    this.getReports()

  }

  ngOnInit() {
  }

  getReports(){
    this.loading['reports'] = false

    this._api.restfulGet( '', 'config/getReportsUpdate')
            .subscribe( res => {
              this.errLoading['reports'] = false
              this.loading['reports'] = false

              this.reports= res.data
            }, err => {

              if(err){
                let error = err.json()
                let errMsg = `${error.msg}: Error ${err.status} - ${err.statusText}`

                this.errMsg['reports'] = errMsg
                console.error(err.statusText, error.msg)
              }

              this.errLoading['reports'] = true
              this.loading['reports'] = false
            })
  }

  runReport( report, id ){
    this.loading[id] = true

    this._api.restfulGet( id,`Procesos/${report}` )
            .subscribe( res => {
              this.loading[id] = false
              this.toastr.success(res.msg, 'Success!')
              this.getReports()
            }, err => {

              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              }

              this.loading[id] = false
            })
  }

  formatTime( time, format ){
    let result = moment.tz( time, 'America/Mexico_City')
    result.tz('America/Bogota')
    return result.format( format )
  }


  uploadCalls( name ){
    let tipo

    if( name == 'ans' ){
      tipo = 'contestadas'
    }else{
      tipo = 'abandonadas'
    }

    this._upl.build(`Archivo de llamadas ${tipo}`, 'calls', name)
  }

  uploaded( event ){

    console.log( event )

    if(event.status){
      this.upl[event.name]=event.fname

      if( event.name == 'ans' ){
        setTimeout( () => {
          this.uploadCalls('unans')
        }, 500)

      }else{
        if( this.upl['ans'] != '' && this.upl['unans'] != '' ){
          this.processCalls()
        }
      }


    }else{
      let error = event.err.json()
      this.toastr.error(error.msg, event.err)
    }
  }

  processCalls( ){
    this.processLoading = true
    this.uplData = {}

    this.processApi('ans')
  }

  processApi( name ){

    this._api.restfulGet( name, 'Procesos/uplCalls' )
              .subscribe( res => {

                this.uplData[name] = res.data

                if( name == 'ans' ){
                  this.processApi( 'unans' )
                }

                if( name == 'unans' ){
                  this.setEnds()
                }

              }, err => {

                this.processLoading = false
                if(err){
                  let error = err.json()
                  this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                  console.error(err.statusText, error.msg)
                }

              })
  }

  setEnds(){

    this._api.restfulGet( '', 'Procesos/setEndTime' )
              .subscribe( res => {

                this.processLoading = false

                this.upl = {
                  ans: '',
                  unans: ''
                }

              }, err => {

                this.processLoading = false
                if(err){
                  let error = err.json()
                  this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                  console.error(err.statusText, error.msg)
                }

              })
  }



}

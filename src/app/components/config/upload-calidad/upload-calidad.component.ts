import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-upload-calidad',
  templateUrl: './upload-calidad.component.html',
  styles: []
})
export class UploadCalidadComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'upload_info'

  loading:Object = {}
  csvData:any
  uploadResult:any

  months:any = [1,2,3,4,5,6,7,8,9,10,11,12]
  years:any

  pec:Object = {
    year: moment().format('YYYY'),
    month: parseInt(moment().format('MM'))-1
  }

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

    this.years = [parseInt(moment().format('YYYY'))-1, parseInt(moment().format('YYYY'))]

  }

  ngOnInit() {
  }

  read( type ){

    let load, process, upl, file

    switch(type){
      case 'fcr':
        load = 'csv'
        process = res => this.fcrProcess(res)
        file = 'fcr'
        break
      case 'pec':
        load = 'csv_pec'
        process = res => this.pecProcess(res)
        file = 'pec'
        break
    }

    this.loading[load] = true

    this._api.restfulGet( `${file}/csv/tmp`, "Procesos/readCsv" )
            .subscribe( res => {

              this.loading[load] = false
              this.uploadFcr( process( res.data ), type )

              console.log(res.data)

            }, err => {
              console.log("ERROR", err)

              this.loading[load] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  csvResult( event, type ){
    this.toastr.success( event.name, 'Status CSV' )
    this.read( type )
  }

  fcrProcess( data ){
    let result:any = []

    for( let item of data ){

      let tmp = {
        id    : item['id'],
        smd_id: item['identificador de empleado'].toLowerCase(),
        fecha : moment(item['fecha de evaluacion'], 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss'),
        mes   : this.pec['month'],
        anio  : this.pec['year'],
        fcr   : item['resuelve la solicitud (euce)'].match(/si/gi) ? 1 : 0,
        bi    : item['subatributos_1'].match(/^~~no corresponde al rac/gi) ? 0 : 1
      }

      result.push(tmp)
    }

    this.csvData = result
    return result
  }

  pecProcess( data ){
    let result:any = []

    for( let item of data ){

      let tmp = {
        id    : item['id'],
        smd_id: item['identificador de empleado'].toLowerCase(),
        fecha : moment(item['fecha de evaluacion'], 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss'),
        ecuf  : item['ecuf (controlable)'].match(/100%/gi) ? 1 : 0,
        ecn   : item['ecn (controlable)'].match(/100%/gi) ? 1 : 0,
        ecc   : item['ecc (controlable)'].match(/100%/gi) ? 1 : 0
      }

      result.push(tmp)
    }

    this.csvData = result
    return result
  }

  uploadFcr( result, type ){

    let api, loader

    switch(type){
      case 'fcr':
        api = "uploadFcr"
        loader = 'uploading'
        break
      case 'pec':
        api = "uploadPec"
        loader = 'uploading_pec'
        break
    }

    this.loading[loader] = true
    let date = `${this.pec['year']}-${ this.pec['month'] < 10 ? '0'+this.pec['month'] : this.pec['month'] }-01`

    this._api.restfulPut( result, `Procesos/${api}/${date}` )
            .subscribe( res => {

              this.loading[loader] = false
              this.uploadResult = res.data
              console.log(res)
              this.toastr.success( `${res.data['UPL_OK']}: Exitosos`, `${res.data['Registros']} Registros` )

            }, err => {
              console.log("ERROR", err)

              this.loading[loader] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  pecRead(){

  }

}

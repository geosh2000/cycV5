import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-upload-logs-pdv',
  templateUrl: './upload-logs-pdv.component.html',
  styles: []
})
export class UploadLogsPdvComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'upload_info'

  loading:Object = {}
  csvData:any
  pdvListData:any
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
                public toastr: ToastrService ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery('#loginModal').modal('show');
          }
        })

    this.years = [parseInt(moment().format('YYYY'))-1, parseInt(moment().format('YYYY'))]

  }

  ngOnInit() {
    this.pdvList()
  }

  read(){

    let load = 'csv_logs', upl, file = 'logsPDV'

    this.loading[load] = true

    this._api.restfulGet( `${file}/csv/tmp`, 'Procesos/readCsv' )
            .subscribe( res => {

              this.loading[load] = false
              // this.uploadFcr( process( res['data'] ), type )
              this.uploadLogs(this.logsProcess( res['data'] ))


              console.log(res['data'])

            }, err => {
              console.log('ERROR', err)

              this.loading[load] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  csvResult( event ){
    this.toastr.success( event.name, 'Status CSV' )
    this.read()
  }

  logsProcess( data ){
    let result:any = []
    let logs = {}
    let resultCsv=[]

    for( let item of data ){

      let idAsesor = this.pdvListData[item['id']]
      let log = item['islogin'] == 'False' ? 'logout' : 'login'
      let fecha = moment(item['dtcreated'], 'DD/MM/YYYY HH:mm:ss A').format('YYYY-MM-DD')
      let ip = item['ipaddress'].replace(/\./gm,'')
      let reg = moment(item['dtcreated'], 'DD/MM/YYYY HH:mm:ss A').format('YYYY-MM-DD HH:mm:ss')

      if( idAsesor ){
          if( logs[idAsesor] ){
            if( logs[idAsesor][fecha] ){
              if( logs[idAsesor][fecha][log] ){
                  logs[idAsesor][fecha][log].push(reg)
              }else{
                logs[idAsesor][fecha][log] = [reg]
              }
            }else{
              logs[idAsesor][fecha] = {
                [log] : [reg]
              }
            }
        }else{
          logs[idAsesor] = {
            [fecha] :{
              [log] : [reg]
            }
          }
        }
        result.push(item)
      }
    }


    // tslint:disable-next-line:forin
    for(let asesor in logs){
      // tslint:disable-next-line:forin
      for(let date in logs[asesor]){

        let login = logs[asesor][date]['login'] ? this.discard(logs[asesor][date]['login'], 'login') : null
        let logout = logs[asesor][date]['logout'] ? this.discard(logs[asesor][date]['logout'], 'logout') : null
        let leftTime = parseFloat(moment(logout).format('X')) - parseFloat(moment(login).format('X'))
        let seconds = moment.duration( leftTime, 'seconds' )
        seconds = moment.duration(seconds.asSeconds() - 1, 'seconds');
        let hr = new DecimalPipe('es-MX').transform(seconds.hours(), '2.0-0')
        let min = new DecimalPipe('es-MX').transform(seconds.minutes(), '2.0-0')
        let sec = new DecimalPipe('es-MX').transform(seconds.seconds(), '2.0-0')

        resultCsv.push({
          asesor: asesor,
          skill: 29,
          login: login,
          logout: logout,
          duracion: login == null || logout == null ? null : `${hr}:${min}:${sec}`
        })

      }
    }

    this.csvData = resultCsv
    return resultCsv
  }

  uploadLogs(data){
    this.loading['uploadLogs'] = true

    this._api.restfulPut( data, 'Procesos/uploadPdvLogs' )
            .subscribe( res => {

              this.loading['uploadLogs'] = false
              let result = res['data']

              if( result['error'] > 0 ){
                this.toastr.error( `Error en ${result['error']} registros`, `Error` )
              }else{
                this.toastr.success( `${result['ok']}  registros cargados`, `Guardado` )
              }
              console.log(res['data'])

            }, err => {
              console.log('ERROR', err)

              this.loading['uploadLogs'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  pdvList(){

    this.loading['pdvList'] = true

    this._api.restfulGet( '', 'Headcount/pdvAsesoresList' )
            .subscribe( res => {

              this.loading['pdvList'] = false
              this.pdvListData = res['data']

              console.log(res['data'])

            }, err => {
              console.log('ERROR', err)

              this.loading['pdvList'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  discard(data, tipo){
    let result:any

    for( let item of data ){
      if( result ){
        switch(tipo){
          case 'login':
            result = moment(item)<result ? moment(item) : result
            break
          case 'logout':
            result = moment(item)>result ? moment(item) : result
            break
        }
      }else{
        result = moment(item)
      }
    }

    return result.format('YYYY-MM-DD HH:mm:ss')
  }
}

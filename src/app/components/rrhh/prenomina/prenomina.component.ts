import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-prenomina',
  templateUrl: './prenomina.component.html',
  styles: []
})
export class PrenominaComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'payroll_prenomina'

  loading:Object = {}

  dataSchedules:any
  dataLogs:any
  dataAusentismos:any
  dataAsesores:any
  dataShow:any
  dataPrenom:any
  built:any

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
    this.getSchedules(25)
  }

  getSchedules( nominaId ){
    this.loading['schedules'] = true

    this._api.restfulGet( nominaId, 'Prenomina/schedules')
              .subscribe( res => {

                this.loading['schedules'] = false

                this.dataSchedules = res.data

                this.getAsesores( nominaId )

              }, err => {
                console.log("ERROR", err)

                this.loading['schedules'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getAsesores( nominaId ){
    this.loading['asesores'] = true

    this._api.restfulGet( nominaId, 'Prenomina/asesores')
              .subscribe( res => {

                this.loading['asesores'] = false

                this.dataAsesores = res.data
                console.log(res.data)

                this.getLogs( nominaId )

              }, err => {
                console.log("ERROR", err)

                this.loading['asesores'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getLogs( nominaId ){
    this.loading['logs'] = true

    this._api.restfulGet( nominaId, 'Prenomina/logs')
              .subscribe( res => {

                this.loading['logs'] = false

                this.dataLogs = res.data

                this.getAusentismos( nominaId )

              }, err => {
                console.log("ERROR", err)

                this.loading['logs'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getAusentismos( nominaId ){
    this.loading['ausentismos'] = true

    this._api.restfulGet( nominaId, 'Prenomina/ausentismos')
              .subscribe( res => {

                this.loading['ausentismos'] = false

                let ausent = {}

                for( let aus of res.data ){
                  if( ausent[aus.asesor] ){
                    ausent[aus.asesor].push( aus )
                  }else{
                    ausent[aus.asesor] = [ aus ]
                  }
                }

                this.dataAusentismos = ausent

                this.buildData()

                console.log(res.data)

              }, err => {
                console.log("ERROR", err)

                this.loading['ausentismos'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  buildData(){
    this.loading['building'] = true
    this.built = false

    for( let {sch, i} of this.dataSchedules.map( (sch, i) => ({ sch, i }) ) ){

      let li, lo
      let schs = {
        x1e : sch.x1e,
        x1s : sch.x1s,
        x2e : sch.x2e,
        x2s : sch.x2s,
        js  : sch.js,
        je  : sch.je
      }

      if( sch.js == null || sch.js == sch.je ){
        schs.js = moment(`${sch.Fecha} 00:00:00`).format('YYYY-MM-DD HH:mm:ss')
        schs.je = moment(`${sch.Fecha} 07:00:00`).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
      }

      if( this.dataLogs && this.dataLogs[sch.Fecha] && this.dataLogs[sch.Fecha][sch.asesor] ){

        for( let log of this.dataLogs[sch.Fecha][sch.asesor] ){
          this.isInside( log, schs, i )
        }

      }else{
        this.dataSchedules[i]['logs'] = {
          j: {
            in: null,
            out: null
          },
          x1: {
            in: null,
            out: null
          },
          x2: {
            in: null,
            out: null
          }
        }
      }
    }

    console.log(this.dataSchedules)

    let dataShow = {}
    let dataPrenom = {}

    for( let item of this.dataSchedules ){
      item['exception'] = this.getExcept( item, 'code' )
      item['exc_desc'] = this.getExcept( item, 'desc' )
      item['hx'] = this.checkLengthHX( item )

      if( dataPrenom[item.asesor] ){

        dataPrenom[item.asesor]['hx'] += item['hx']

        if( dataPrenom[item.asesor][item['exception']] ){
          dataPrenom[item.asesor][item['exception']]++
        }else{
          dataPrenom[item.asesor][item['exception']] = 1
        }

      }else{
        dataPrenom[item.asesor] = {
          [item['exception']] : 1,
          hx                  : item['hx']
        }
      }

      if( dataShow[item.asesor] ){
        dataShow[item.asesor][item.Fecha] = item
      }else{
        dataShow[item.asesor] = {
          [item.Fecha]  : item
        }
      }
    }


    this.dataShow = dataShow
    this.dataPrenom = dataPrenom
    console.log(this.dataPrenom)

    this.loading['building'] = false
    this.built = true
  }

  getExcept( data, type ){

    let result = {
      code: '',
      desc: ''
    }

    if( this.dataAusentismos[data.asesor] ){
      for( let aus in this.dataAusentismos[data.asesor] ){
        if( moment(data.Fecha) >= moment(this.dataAusentismos[data.asesor][aus].Inicio) && moment(data.Fecha) <= moment(this.dataAusentismos[data.asesor][aus].Fin) ){
          result = {
            code: this.dataAusentismos[data.asesor][aus]['Code'],
            desc: this.dataAusentismos[data.asesor][aus]['Ausentismo']
          }
          return result[type]
        }
      }
    }

    if( data.logs.j.in == null ){
      if( data.js == data.je ){
        result = {
          code: "D",
          desc: "Descanso"
        }
        return result[type]
      }else{
        result = {
          code: "FA",
          desc: "Falta Injustificada"
        }
        return result[type]
      }
    }else{
      if( this.checkSA( data.js, data.je, data.logs.j.in, data.logs.j.out ) ){
        result = {
          code: "FA",
          desc: "Salida Anticipada / Jornada < 60%"
        }
        return result[type]
      }else{
        if( this.checkLength( data.js, data.je, data.logs.j.in, data.logs.j.out ) ){
          result = {
            code: "FA",
            desc: "Jornada < 60%"
          }
          return result[type]
        }else{
          return "A"
        }
      }
    }

  }


  isInside( logueos, sch, i ){

    let logs = {}

    if( sch.js == sch.je ){
      logs  = {
        j: {
          in: logueos.login,
          out: logueos.logout
        },
        x1: {
          in: null,
          out: null
        },
        x2: {
          in: null,
          out: null
        }
      }
    }else{
      logs['j']   = this.compareLogsIn( logueos.login, logueos.logout, sch, 'j')
      logs['x1']  = this.compareLogsIn( logueos.login, logueos.logout, sch, 'x1')
      logs['x2']  = this.compareLogsIn( logueos.login, logueos.logout, sch, 'x2')
    }

    if( this.dataSchedules[i]['logs'] ){
      this.pushCompareDates(i, logs, 'j', 'in')
      this.pushCompareDates(i, logs, 'j', 'out')
      this.pushCompareDates(i, logs, 'x1', 'in')
      this.pushCompareDates(i, logs, 'x1', 'out')
      this.pushCompareDates(i, logs, 'x2', 'in')
      this.pushCompareDates(i, logs, 'x2', 'out')
    }else{
      this.dataSchedules[i]['logs'] = {
        j : logs['j'],
        x1 : logs['x1'],
        x2 : logs['x2']
      }
    }

  }

  compareLogsIn( login, logout, sch, type ){

    let log = {
      in    : moment(login),
      out   : moment(logout),
      js    : moment(sch[`${type}s`]),
      je    : moment(sch[`${type}e`])
    }

    let result = {
      in  : null,
      out : null
    }

    if( log['js'] == null || log['je'] == null ){
      return result
    }

    if( log['in'] <= log['js'] ){
      if( log['out'] >= log['js'] ){
        result['in'] = log['js'].format('YYYY-MM-DD HH:mm:ss')
      }
    }else{
      if( log['in'] < log['je'] ){
        result['in'] = log['in'].format('YYYY-MM-DD HH:mm:ss')
      }
    }

    if( log['out'] < log['je'] ){
      if( log['out'] > log['js'] ){
        result['out'] = log['out'].format('YYYY-MM-DD HH:mm:ss')
      }
    }else{
      if( log['in'] < log['je'] ){
        result['out'] = log['je'].format('YYYY-MM-DD HH:mm:ss')
      }
    }

    return result

  }

  pushCompareDates(i, logs, type, momentum){

    if( momentum == 'in' ){
      if( this.dataSchedules[i]['logs'][type][momentum] == null || this.dataSchedules[i]['logs'][type][momentum] > logs[type][momentum] ){
        this.dataSchedules[i]['logs'][type][momentum] = logs[type][momentum]
      }
    }

    if( momentum == 'out' ){
      if( this.dataSchedules[i]['logs'][type][momentum] == null || this.dataSchedules[i]['logs'][type][momentum] < logs[type][momentum] ){
        this.dataSchedules[i]['logs'][type][momentum] = logs[type][momentum]
      }
    }

  }

  printTime( time, format ){

    if(time == null){
      return ''
    }

    let cunTime = moment.tz(time, 'America/Mexico_city').tz('America/Bogota')

    return cunTime.format( format )

  }

  checkSA( js, je, lin, lout ){

    if( moment(lout) < moment(je) ){

      let done = moment(lout).diff(moment(lin), 'seconds')
      let jornada = moment(je).diff(moment(js), 'seconds')

      if( done / jornada < 0.6 ){
        return true
      }else{
        return false
      }

    }

    return false
  }

  checkLength( js, je, lin, lout ){

    let done = moment(lout).diff(moment(lin), 'seconds')
    let jornada = moment(je).diff(moment(js), 'seconds')

    if( done / jornada < 0.6 ){
      return true
    }else{
      return false
    }

  }

  checkLengthHX( item ){

    let x1 = 0, x2 = 0

    if( (item.x1s != item.x1e) && item.logs.x1.in != null ){
      x1 = moment(item.logs.x1.out).diff(moment(item.logs.x1.in), 'seconds')
    }

    if( (item.x2s != item.x2e) && item.logs.x2.in != null ){
      x2 = moment(item.logs.x2.out).diff(moment(item.logs.x2.in), 'seconds')
    }

    let total = (x1 + x2)/60/60

    if( (x1 + x2)/60 >= 25 ){
      return total
    }else{
      return 0
    }


  }

}

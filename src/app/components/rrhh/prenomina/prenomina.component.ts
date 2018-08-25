 import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

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

  listCortes:any
  opsList:any
  listCortesFlag:boolean = false
  dataSchedules:any
  dataLogs:any
  dataAusentismos:any
  dataFestivos:any
  dataCxc:any
  prenomCxc:Object = {}
  dataAsesores:any
  dataBonos:any
  dataShow:any
  dataPrenom:any
  built:any

  tableHeaders:any = []

  params:Object = { corte: '', op: '' }

  constructor(public _api: ApiService,
                private titleService: Title,
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

    this.tableHeaders = [
      { t: 'D Faltas JUS', code: 'FJ', type: 'd' },
      { t: 'F Faltas JUS', code: 'FJ', type: 'f' },
      { t: 'D Faltas IN', code: 'F', type: 'd' },
      { t: 'F Faltas IN', code: 'F', type: 'f' },
      { t: 'D Suspension', code: 'SUS', type: 'd' },
      { t: 'F Suspension', code: 'SUS', type: 'f' },
      { t: 'Maternidad', code: 'INC_MT', type: 'd' },
      { t: 'Enfermedad', code: 'INC_EN', type: 'd' },
      { t: 'Accidente', code: 'INC_AC', type: 'd' },
      { t: 'Acc por Riesgo', code: 'INC_RT', type: 'd' },
      { t: 'D Permiso sin g', code: 'PS', type: 'd' },
      { t: 'F Permiso sin g', code: 'PS', type: 'f' },
      { t: 'D Permiso con g', code: 'PC', type: 'd' },
      { t: 'F Permiso con g', code: 'PC', type: 'f' },
      { t: 'D Vacaciones', code: 'VAC', type: 'd' },
      { t: 'F Vacaciones', code: 'VAC', type: 'f' },
      { t: 'Prima Vacacional', code: null, type: 'd' },
      { t: 'Dias de Prima Vacacional', code: null, type: 'd' },
      { t: 'Horas Extra', code: 'hx', type: 'd' },
      { t: 'Horas Extra 2', code: null, type: 'd' },
      { t: 'Horas Extra 3', code: null, type: 'd' },
      { t: 'Dias Pendientes', code: null, type: 'd' },
      { t: 'Descanso Trabajado', code: 'DT', type: 'd' },
      { t: 'Día Festivo', code: 'FES', type: 'd' },
      { t: 'Prima Dominical', code: 'DOM', type: 'd' }
    ]

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Prenomina');
    this.getCortes()
  }

  getSchedules(){
    this.loading['schedules'] = true

    this._api.restfulPut( this.params, 'Prenomina/schedules')
              .subscribe( res => {

                this.loading['schedules'] = false

                this.dataSchedules = res['data']
                // console.log(this.dataSchedules)

                this.getFestivos()

              }, err => {
                console.log('ERROR', err)

                this.loading['schedules'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getFestivos(){
    this.loading['festivos'] = true

    this._api.restfulPut( this.params, 'Prenomina/festivos')
              .subscribe( res => {

                this.loading['festivos'] = false

                this.dataFestivos = res['data']

                this.getAsesores()

              }, err => {
                console.log('ERROR', err)

                this.loading['festivos'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getAsesores(){
    this.loading['asesores'] = true

    this._api.restfulPut( this.params, 'Prenomina/asesores')
              .subscribe( res => {

                this.loading['asesores'] = false

                this.dataAsesores = res['data']
                // console.log(res['data'])

                this.getLogs()

              }, err => {
                console.log('ERROR', err)

                this.loading['asesores'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getLogs( ){
    this.loading['logs'] = true

    this._api.restfulPut( this.params, 'Prenomina/logs')
              .subscribe( res => {

                this.loading['logs'] = false

                this.dataLogs = res['data']
                // console.log(this.dataLogs)

                this.getAusentismos( )

              }, err => {
                console.log('ERROR', err)

                this.loading['logs'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getAusentismos( ){
    this.loading['ausentismos'] = true

    this._api.restfulPut( this.params, 'Prenomina/ausentismos')
              .subscribe( res => {

                this.loading['ausentismos'] = false

                this.dataAusentismos = res['data']
                // console.log(res['data'])

                this.getBonos()


              }, err => {
                console.log('ERROR', err)

                this.loading['ausentismos'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getBonos( ){
    this.loading['bonos'] = true

    this._api.restfulPut( this.params, 'Bonos/prenomina')
              .subscribe( res => {

                this.loading['bonos'] = false

                this.dataBonos = res['data']
                // console.log(res['data'])

                this.getCxc()


              }, err => {
                console.log('ERROR', err)

                this.loading['bonos'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getCxc( ){
    this.loading['cxc'] = true
    this.prenomCxc = {}

    this._api.restfulPut( this.params, 'Prenomina/cxc')
              .subscribe( res => {

                this.loading['cxc'] = false
                this.loading['building'] = true

                this.dataCxc = res['data']

                // tslint:disable-next-line:forin
                for( let item of res['data'] ){
                  this.prenomCxc[item['asesor']] = {
                    '0': {
                      monto:    item['monto_0'],
                      detail:   item['locs_0']
                    },
                    '1': {
                      monto:    item['monto_1'],
                      detail:   item['locs_1']
                    },
                  }
                }

                this.buildData()


              }, err => {
                console.log('ERROR', err)

                this.loading['cxc'] = false

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

    let dataShow = {}
    let dataPrenom = {}
    let tmp = ''
    let code = ''

    for( let item of this.dataSchedules ){
      item['exception'] = this.getExcept( item, 'code' )
      item['rcode'] = this.getExcept( item, 'rcode' )
      item['exc_desc'] = this.getExcept( item, 'desc' )
      item['hx'] = this.checkLengthHX( item )


      if( dataPrenom[item.asesor] ){

        if(this.dataBonos){
          dataPrenom[item.asesor]['bono'] = this.dataBonos[item.asesor]
        }
        dataPrenom[item.asesor]['hx'] += item['hx']

        if( dataPrenom[item.asesor][item.rcode] ){

          if( tmp != item.rcode ){
            tmp = item.rcode
            code = item.rcode

            if( code != item.exception){
              if( dataPrenom[item.asesor][item['exception']] ){
                dataPrenom[item.asesor][item['exception']]['days']++
              }else{
                dataPrenom[item.asesor][item['exception']] = { days: 1, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
              }
            }else{
              dataPrenom[item.asesor][item.rcode].dates.push({ inicio: item.Fecha, fin: item.Fecha })
              dataPrenom[item.asesor][code].days++
            }



          }else{

            let index = dataPrenom[item.asesor][code].dates.length -1

            if( code != item.exception){
              if( dataPrenom[item.asesor][item['exception']] ){
                dataPrenom[item.asesor][item['exception']]['days']++
              }else{
                dataPrenom[item.asesor][item['exception']] = { days: 1, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
              }
            }else{
              dataPrenom[item.asesor][code].dates[index].fin = item.Fecha
              dataPrenom[item.asesor][code].days++
            }


          }


        }else{

          tmp = item.rcode
          code = item.rcode

          if( item.exception == item.rcode ){
            dataPrenom[item.asesor][item.rcode] = { days: 1, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
          }else{

            if( dataPrenom[item.asesor][item['exception']] ){
              dataPrenom[item.asesor][item['exception']]['days']++
            }else{
              dataPrenom[item.asesor][item['exception']] = { days: 1, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
            }

            dataPrenom[item.asesor][item.rcode] = { days: 0, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
          }

        }

      }else{

        tmp = item.rcode
        code = item.rcode

        let exc = {}


        if( item.exception == item.rcode ){
          exc[item.rcode] = { days: 1, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
        }else{
          exc[item.exception] = { days: 1, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
          exc[item.rcode] = { days: 0, dates: [{ inicio: item.Fecha, fin: item.Fecha }] }
        }

        dataPrenom[item.asesor] = exc
        dataPrenom[item.asesor]['hx'] = item['hx']
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

    this.loading['building'] = false
    this.built = true

    // console.log(this.dataPrenom)
  }

  getExcept( data, type ){

    let result = {
      code: '',
      rcode: '',
      desc: ''
    }

    if( this.dataAusentismos[data.Fecha] && this.dataAusentismos[data.Fecha][data.asesor] ){

      if( this.dataAusentismos[data.Fecha][data.asesor].a == 1 ){

        result = {
          code: this.dataAusentismos[data.Fecha][data.asesor]['Code'],
          rcode: this.dataAusentismos[data.Fecha][data.asesor]['Code'],
          desc: this.dataAusentismos[data.Fecha][data.asesor]['a_name']
        }

        if( this.dataFestivos && this.dataFestivos[data.Fecha] ){
          if( this.dataAusentismos[data.Fecha][data.asesor]['Code'] == 'F' || this.dataAusentismos[data.Fecha][data.asesor]['Code'] == 'FJ'){
            result = {
              code: 'D',
              rcode: 'D',
              desc: 'Descanso por Festivo'
            }
          }
        }

      }else{
        if( this.dataAusentismos[data.Fecha][data.asesor].d == 1 ){
          result = {
            code: 'D',
            rcode: this.dataAusentismos[data.Fecha][data.asesor]['Code'],
            desc: this.dataAusentismos[data.Fecha][data.asesor]['a_name']
          }
        }else{
          if( this.dataAusentismos[data.Fecha][data.asesor].b == 1 ){
            result = {
              code: 'B',
              rcode: this.dataAusentismos[data.Fecha][data.asesor]['Code'],
              desc: this.dataAusentismos[data.Fecha][data.asesor]['a_name']
            }
          }else{
            result = {
              code: 'NA',
              rcode: this.dataAusentismos[data.Fecha][data.asesor]['Code'],
              desc: this.dataAusentismos[data.Fecha][data.asesor]['a_name']
            }
          }
        }
      }

      if( result['code'] == 'DT' ){
        if( !this.checkSA( data.js, data.je, data.logs.j.in, data.logs.j.out ) && parseInt(this.dataAusentismos[data.Fecha][data.asesor].pdt) == 1 && !this.checkLength( data.js, data.je, data.logs.j.in, data.logs.j.out ) && data.logs.j.in != null ){
          result = {
            code: 'DT',
            rcode: 'DT',
            desc: 'Descanso Trabajado'
          }
        }else{
          result = {
            code: 'D',
            rcode: 'D',
            desc: 'Descanso'
          }
        }
      }

      return result[type]
    }

    if( data.logs.j.in == null ){
      if( data.js == data.je ){
        result = {
          code: 'D',
          rcode: 'D',
          desc: 'Descanso'
        }
        return result[type]
      }else{
        if( this.dataFestivos && this.dataFestivos[data.Fecha] ){
          result = {
            code: 'D',
            rcode: 'D',
            desc: 'Descanso por Festivo'
          }
        }else{
          result = {
            code: 'F',
            rcode: 'F',
            desc: 'Falta Injustificada'
          }
        }
        return result[type]
      }
    }else{
      if( this.checkSA( data.js, data.je, data.logs.j.in, data.logs.j.out ) ){
        if( this.dataFestivos && this.dataFestivos[data.Fecha] ){
          result = {
            code: 'D',
            rcode: 'D',
            desc: 'Descanso por Festivo'
          }
        }else{
          result = {
            code: 'F',
            rcode: 'F',
            desc: 'Salida Anticipada Jornada < 60%'
          }
        }
        return result[type]
      }else{
        if( this.checkLength( data.js, data.je, data.logs.j.in, data.logs.j.out ) ){
          if( this.dataFestivos && this.dataFestivos[data.Fecha] ){
            result = {
              code: 'D',
              rcode: 'D',
              desc: 'Descanso por Festivo'
            }
          }else{
            result = {
              code: 'F',
              rcode: 'F',
              desc: 'Jornada < 60%'
            }
          }
          return result[type]
        }else{

          if( this.dataFestivos && this.dataFestivos[data.Fecha] ){
            result = {
              code: 'FES',
              rcode: 'FES',
              desc: 'Festivo Trabajado'
            }
          }else{
            result = {
              code: 'A',
              rcode: 'A',
              desc: 'Asistencia'
            }

            // ==========================================
            // START Evaluación de Descansos Trabajados
            // ==========================================
            if( ( parseInt(moment(data.Fecha).format('E')) == 7 && parseInt( moment(data.js).format('HH') ) <= 21 ) || ( parseInt(moment(data.Fecha).format('E')) == 6 && parseInt( moment(data.js).format('HH') ) >= 22 ) ){
              if( data.js != data.je ){
                result = {
                  code: 'DOM',
                  rcode: 'DOM',
                  desc: 'Domingo Trabajado'
                }
              }
            }
            // ==========================================
            // END Evaluación de Descansos Trabajados
            // ==========================================
          }

          return result[type]
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

  checkLengthHX( item ){

    let x1 = 0, x2 = 0

    if(item.phx == 0){
      return 0
    }

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

  getCortes(){
    this._api.restfulGet( '', 'Prenomina/listCortes' )
            .subscribe( res => {

              this.listCortesFlag = true
              this.listCortes = res['data']
              this.opsList = res['ops']


            }, err => {
              console.log('ERROR', err)

              this.listCortesFlag = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  selectedCorte(){
    this.getSchedules()
  }

  printDates( item ){
    let result = ''

    for(let dates of item){

      if( result != '' ){
        result = `${result},`
      }

      if( dates.inicio == dates.fin ){
        result = `${result} ${moment(dates.inicio).format('DD/MM/YYYY')}`
      }else{
        result = `${result} ${moment(dates.inicio).format('DD/MM/YYYY')} a ${moment(dates.fin).format('DD/MM/YYYY')}`
      }
    }

    return result
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});

    // tslint:disable-next-line:forin
    for( let cell in wb.Sheets.Sheet1 ){

      let match = cell.match(/^[A-Z]+[1]{1}$/g)
      if( !match ){
        if( cell.match(/^(?:(([A,M,O,Q,S-W,Y]{1})|([A]{1}[A,E,I-K]{1})))(?=[1-9]{1}[0-9]*)/g) ){
          if( wb.Sheets.Sheet1[cell].v != 'NA' ){
            wb.Sheets.Sheet1[cell].t = 'n'
            wb.Sheets.Sheet1[cell].v = wb.Sheets.Sheet1[cell].v.trim()
          }
        }
      }
    }

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }
}

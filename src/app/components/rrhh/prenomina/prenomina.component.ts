import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

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
  listCortesFlag:boolean = false
  dataSchedules:any
  dataLogs:any
  dataAusentismos:any
  dataCxc:any
  prenomCxc:any
  dataAsesores:any
  dataShow:any
  dataPrenom:any
  built:any

  tableHeaders:any = []

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

    this.tableHeaders = [
      { t: 'Descansos', code: 'D', type: 'd' },
      { t: 'Asistencias', code: 'A', type: 'd' },
      { t: 'Capacitación', code: 'CA', type: 'd' },
      { t: 'D Faltas JUS', code: 'FA', type: 'd' },
      { t: 'F Faltas JUS', code: 'FA', type: 'f' },
      { t: 'D Faltas IN', code: 'FJ', type: 'd' },
      { t: 'F Faltas IN', code: 'FJ', type: 'f' },
      { t: 'D Suspension', code: 'SUS', type: 'd' },
      { t: 'F Suspension', code: 'SUS', type: 'f' },
      { t: 'D Maternidad', code: 'INC_MT', type: 'd' },
      { t: 'F Maternidad', code: 'INC_MT', type: 'f' },
      { t: 'D Enfermedad', code: 'INC_EN', type: 'd' },
      { t: 'F Enfermedad', code: 'INC_EN', type: 'f' },
      { t: 'D Accidente', code: 'INC_AC', type: 'd' },
      { t: 'F Accidente', code: 'INC_AC', type: 'f' },
      { t: 'D Acc por Riesgo', code: 'INC_RT', type: 'd' },
      { t: 'F Acc por Riesgo', code: 'INC_RT', type: 'f' },
      { t: 'D Permiso sin g', code: 'PS', type: 'd' },
      { t: 'F Permiso sin g', code: 'PS', type: 'f' },
      { t: 'D Permiso con g', code: 'PC', type: 'd' },
      { t: 'F Permiso con g', code: 'PC', type: 'f' },
      { t: 'D Vacaciones', code: 'VAC', type: 'd' },
      { t: 'F Vacaciones', code: 'VAC', type: 'f' },
      { t: 'D Descanso Trabajado', code: 'DT', type: 'd' },
      { t: 'F Descanso Trabajado', code: 'DT', type: 'f' },
      { t: 'D Día Festivo', code: 'FES', type: 'd' },
      { t: 'F Día Festivo', code: 'FES', type: 'f' },
      { t: 'D Domingos Trabajados', code: 'DOM', type: 'd' },
      { t: 'F Domingos Trabajados', code: 'DOM', type: 'f' }
    ]

  }

  ngOnInit() {
    this.getCortes()
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

                this.dataAusentismos = res.data

                this.getCxc(nominaId)


              }, err => {
                console.log("ERROR", err)

                this.loading['ausentismos'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getCxc( nominaId ){
    this.loading['cxc'] = true
    this.prenomCxc = {}

    this._api.restfulGet( nominaId, 'Prenomina/cxc')
              .subscribe( res => {

                this.loading['cxc'] = false
                this.loading['building'] = true

                this.dataCxc = res.data

                for( let asesor in res.data ){
                  for( let cxc of res.data[asesor] ){
                    if( this.prenomCxc[asesor] ){
                      this.prenomCxc[asesor][cxc.tipo]['monto'] += parseFloat(cxc.monto)
                      this.prenomCxc[asesor][cxc.tipo]['detail'] = `${this.prenomCxc[asesor][cxc.tipo]['detail']}, ${cxc.localizador} (${cxc.n_pago}/${cxc.pagos})`
                    }else{

                      let other

                      if( cxc.tipo == 1 ){
                        other = 0
                      }else{
                        other = 1
                      }

                      this.prenomCxc[asesor] = {
                        [cxc.tipo]: {
                            monto: parseFloat(cxc.monto),
                            detail: `${cxc.localizador} (${cxc.n_pago}/${cxc.pagos})`
                          },
                        [other]: {
                          monto: 0,
                          detail: ''
                        }

                      }
                    }
                  }
                }

                this.buildData()


              }, err => {
                console.log("ERROR", err)

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


      return result[type]
    }

    if( data.logs.j.in == null ){
      if( data.js == data.je ){
        result = {
          code: "D",
          rcode: "D",
          desc: "Descanso"
        }
        return result[type]
      }else{
        result = {
          code: "FA",
          rcode: "FA",
          desc: "Falta Injustificada"
        }
        return result[type]
      }
    }else{
      if( this.checkSA( data.js, data.je, data.logs.j.in, data.logs.j.out ) ){
        result = {
          code: "FA",
          rcode: "FA",
          desc: "Salida Anticipada / Jornada < 60%"
        }
        return result[type]
      }else{
        if( this.checkLength( data.js, data.je, data.logs.j.in, data.logs.j.out ) ){
          result = {
            code: "FA",
            rcode: "FA",
            desc: "Jornada < 60%"
          }
          return result[type]
        }else{
          if( moment(data.Fecha).format('E') == 7 ){
            result = {
              code: "DOM",
              rcode: "DOM",
              desc: "Domingo Trabajado"
            }
          }else{
            result = {
              code: "A",
              rcode: "A",
              desc: "Asistencia"
            }
          }
          return result
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

  getCortes(){
    this._api.restfulGet( '', 'Prenomina/listCortes' )
            .subscribe( res => {

              this.listCortesFlag = true
              this.listCortes = res.data


            }, err => {
              console.log("ERROR", err)

              this.listCortesFlag = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  selectedCorte( event ){
    this.getSchedules( event )
  }

  printDates( item ){
    let result = ''

    for(let dates of item){

      if( result != '' ){
        result = `${result},`
      }

      if( dates.inicio == dates.fin ){
        result = `${result} ${moment(dates.inicio).format('DD/MM')}`
      }else{
        result = `${result} ${moment(dates.inicio).format('DD/MM')} a ${moment(dates.fin).format('DD/MM')}`
      }
    }

    return result
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});

    for( let cell in wb.Sheets.Sheet1 ){

      let match = cell.match(/^[A-Z]+[1]{1}$/g)
      if( !match ){
        if( cell.match(/^(?:(([A,B,J,N-R,T,V,X,Z]{1})|([A]{1}[B,D,F,H,J,L,N,P]{1})))(?=[1-9]{1}[0-9]*)/g) ){
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
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
}

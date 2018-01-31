import { Component, OnInit, ViewContainerRef, ViewChild, Injectable, NgZone, AfterViewInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { NgbDateStruct, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import { PyaExceptionComponent } from '../../formularios/pya-exception.component';

import * as moment from 'moment-timezone';
declare var jQuery:any;

@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<Date> {

  fromModel(date: Date): NgbDateStruct {
    return (date && date.getFullYear) ? {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()} : null;
  }

  toModel(date: NgbDateStruct): Date {
    return date ? new Date(date.year, date.month - 1, date.day) : null;
  }

}

@Component({
  selector: 'app-pya',
  templateUrl: './pya.component.html',
  styles: [`a: { color: white }`],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class PyaComponent implements OnInit {

  @ViewChild( PyaExceptionComponent ) _pya:PyaExceptionComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'monitor_pya'

  loading:Object = {}
  dateSearch:Date
  dateModel:any

  dataPerHour = {}
  dataLogs:any
  asesorLogs:any
  rawSchedules:any
  dataSchedules:any
  dataExceptions:Object = {}
  lu:any

  asesorIndex:Object = {}
  hrs:any = []

  rts:Object = {
    a: {},
    b: {},
    sa: {},
    fa: {},
    fdh: {}
  }
  rets:Object = {
    a: [],
    b: [],
    sa: [],
    fa: [],
    fdh: []
  }

  alert:Object = {}

  fragment:string

  timerFlag:boolean = false
  timeCount:number
  loopCount:number

  popOvers:Object = {}
  killProcess:boolean = false

  constructor( public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                private zone: NgZone,
                private route: ActivatedRoute ) {

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

    this.dateSearch = new Date()

    this.hrsBuild()
    this.getSchedules()


  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;

      let element = document.querySelector ( "#" + this.fragment )


      if ( element ){
        this.alert[fragment] = true
        setTimeout(() => this.alert[fragment] = false, 3000)

        let elementRect = element.getBoundingClientRect();
        let absoluteElementTop = elementRect.top + window.pageYOffset;
        let middle = absoluteElementTop - (window.innerHeight / 2);
        window.scrollTo(0, middle);

        // element.scrollIntoView(false)

      }
    });

  }


  hrsBuild(){
    for(let i = -1; i < 48; i++){
      this.hrs.push(i)
    }
  }

  getSchedules(){
    this.dateModel = moment(this.dateSearch).format('YYYY-MM-DD')
    this.loading['schedules'] = true
    this.timerFlag = false
    this.killProcess = true

    this._api.restfulGet( this.dateModel, 'Pya/horarios' )
            .subscribe( res => {

              this.loading['schedules'] = false
              this.dataSchedules = res.data
              this.rawSchedules = res.data

              this.buildSchedules( res.data, true, () => {
                this.getLogs()
                this.loopCount = 15
                this.timeCount = 60

                // console.log(this.dataPerHour)
                // console.log(this.asesorIndex)
                // console.log(this.dataExceptions)
              })



            }, err => {
              console.log("ERROR", err)

              this.loading['schedules'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  buildSchedules( res, flag = true, callback? ){
    let idIndex = {}

    this.dataPerHour = {}
    this.asesorIndex = {}

    for( let item in res ){

      let it = res[item]
      let h

      if( (it.Ausentismo != null && it.showPya != 1) || it.js == null || it.js == it.je ){
        h = -1
      }else{
        let hour = parseInt(moment.tz(it.js, 'America/Mexico_city').tz('America/Bogota').format('HH'))
        let minute = parseInt(moment.tz(it.js, 'America/Mexico_city').tz('America/Bogota').format('mm'))

        if( minute > 0 ){
          hour += 0.5
        }

        hour = hour * 2

        h = hour
      }

      this.dataSchedules[item]['h'] = h

      if( this.dataPerHour[h] ){
        this.dataPerHour[h].push(it)

        let ind = this.dataPerHour[h].length
        idIndex[it.asesor] = { h: h, k: ind-1 }
      }else{
        this.dataPerHour[h] = [ it ]

        idIndex[it.asesor] = { h: h, k: 0 }
      }

    }

    this.asesorIndex = idIndex

    if (callback && typeof(callback) == "function") {
      callback()
    }
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

  bgCards( item ){

    if( item.Ausentismo != null ){
      return 'd-flex justify-content-center align-items-center bg-info text-white'
    }

    if( item.js == null ){
      return 'd-flex justify-content-center align-items-center bg-secondary'
    }

    if( item.js == item.je ){
      return 'd-flex justify-content-center align-items-center bg-info text-white'
    }

  }

  getLogs(){

    this.loading['logs'] = true
    this.timerFlag = false
    this.killProcess = true

    this._api.restfulGet( this.dateModel, 'Pya/sesiones' )
            .subscribe( res => {

              this.dataLogs = {}
              this.asesorLogs = {}
              this.rets = {
                a: [],
                b: [],
                sa: [],
                fa: [],
                fdh: []
              }

              for( let item in res.data ){
                let it = res.data[item]
                this.isInside( it.login, it.logout, it.asesor )

                if( this.asesorLogs[res.data[item]['asesor']] ){
                  this.asesorLogs[res.data[item]['asesor']].push({ login: res.data[item]['login'], logout: res.data[item]['logout']})
                }else{
                  this.asesorLogs[res.data[item]['asesor']] = [{ login: res.data[item]['login'], logout: res.data[item]['logout']}]
                }
              }

              this.lu = res.lu['lu']

              this.getExceptions()

            }, err => {
              console.log("ERROR", err)

              this.loading['logs'] = false

              this.killProcess = false
              this.timeCount = 30
              this.timerFlag = true
              this.timerLoad()

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  getExceptions(){
    this.loading['logs'] = true
    this.timerFlag = false

    this._api.restfulGet( this.dateModel, 'Pya/exceptions' )
            .subscribe( res => {

              this.loading['logs'] = false

              // console.log("Excep", res.data)

              this.dataExceptions = {}
              this.rets = {
                a: [],
                b: [],
                sa: [],
                fa: [],
                fdh: []
              }

              for( let item of res.data ){
                this.dataExceptions[item.asesor] = item
              }

              this.killProcess =false
              this.timeCount = 120
              this.timerFlag = true
              this.timerLoad()


            }, err => {
              console.log("ERROR", err)

              this.loading['logs'] = false

              this.killProcess =false
              this.timeCount = 30
              this.timerFlag = true
              this.timerLoad()

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }


  isInside( login, logout, asesor ){

    let sch = this.dataPerHour[this.asesorIndex[asesor].h][this.asesorIndex[asesor].k]

    let logs = {}

    if( sch.js == sch.je ){
      logs  = {
        j: {
          in: login,
          out: logout
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
      logs['j']   = this.compareLogsIn( login, logout, sch, 'j')
      logs['x1']  = this.compareLogsIn( login, logout, sch, 'x1')
      logs['x2']  = this.compareLogsIn( login, logout, sch, 'x2')
    }

    if( this.dataLogs[asesor] ){
      this.pushCompareDates(asesor, logs, 'j', 'in')
      this.pushCompareDates(asesor, logs, 'j', 'out')
      this.pushCompareDates(asesor, logs, 'x1', 'in')
      this.pushCompareDates(asesor, logs, 'x1', 'out')
      this.pushCompareDates(asesor, logs, 'x2', 'in')
      this.pushCompareDates(asesor, logs, 'x2', 'out')
    }else{
      this.dataLogs[asesor] = {
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

  pushCompareDates(asesor, logs, type, momentum){

    if( momentum == 'in' ){
      if( this.dataLogs[asesor][type][momentum] == null || this.dataLogs[asesor][type][momentum] > logs[type][momentum] ){
        this.dataLogs[asesor][type][momentum] = logs[type][momentum]
      }
    }

    if( momentum == 'out' ){
      if( this.dataLogs[asesor][type][momentum] == null || this.dataLogs[asesor][type][momentum] < logs[type][momentum] ){
        this.dataLogs[asesor][type][momentum] = logs[type][momentum]
      }
    }

  }

  pBarVal( asesor, type ){

    if( !this.dataLogs[asesor] ){
      return 0
    }

    let logs  = this.dataLogs[asesor]
    let sch   = this.dataPerHour[this.asesorIndex[asesor].h][this.asesorIndex[asesor].k]

    if( logs[type].in == null || logs[type].out == null ){
      return 0
    }

    let info = {
      in    : moment(logs[type].in),
      out   : moment(logs[type].out),
      js    : moment(sch[`${type}s`]),
      je    : moment(sch[`${type}e`]),
    }


    return parseInt( info['out'].format( 'x' ) ) - parseInt( info['in'].format( 'x' ) )
  }

  setExcept( asesor, type = 'exception'){

    let result = {
      exp   : null,
      class : null
    }

    let flagAus = false

    if( !this.dataLogs ){
      result['exp'] = "..."
      result['class'] = ""

      if( type == 'exception' ){
        return result['exp']
      }else{
        return result['class']
      }
    }

    let now = moment()
    let sch   = this.dataPerHour[this.asesorIndex[asesor].h][this.asesorIndex[asesor].k]

    let info = {
      in    : null,
      out   : null,
      js    : moment.tz(sch[`js`], 'America/Mexico_city').tz("America/Bogota"),
      je    : moment.tz(sch[`je`], 'America/Mexico_city').tz("America/Bogota"),
    }

    if( sch.Ausentismo != null || sch.js == sch.je ){
      flagAus = true
    }

    if( !this.dataLogs[asesor] ){

      if( !flagAus ){

        if( now > info['js'].clone().add(1, 'minutes') ){
          if( now >= info['js'].clone().add(13, 'minutes') ){
            if( now > info['js'].clone().add(60, 'minutes') ){
              result['exp'] = "FA"
              result['class'] = "bg-danger"

              this.listRts( type, asesor, 'fa' )
            }else{
              result['exp'] = "RT-B"
              result['class'] = "bg-warning"
            }
          }else{
            result['exp'] = "RT-A"
            result['class'] = "bg-warning"
          }
        }else{
          result['exp'] = "..."
          result['class'] = ""
        }

      }else{
        result['exp'] = "..."
        result['class'] = "bg-secondary"
      }

    }else{
      let logs  = this.dataLogs[asesor]

      info['in'] = moment.tz(logs['j'].in, 'America/Mexico_city').tz("America/Bogota")
      info['out'] = moment.tz(logs['j'].out, 'America/Mexico_city').tz("America/Bogota")

      if( logs['j'].in == null || logs['j'].out == null ){

        if( logs['x1'].in != null || logs['x2'].in != null ){
          result['exp'] = "HX"
          result['class'] = "bg-info"
        }else{

          if( !flagAus ){

            if( now > info['js'].clone().add(1, 'minutes') ){
              if( now >= info['js'].clone().add(13, 'minutes') ){
                if( now > info['js'].clone().add(60, 'minutes') ){
                  result['exp'] = "FA"
                  result['class'] = "bg-danger"

                  this.listRts( type, asesor, 'fa' )
                }else{
                  result['exp'] = "RT-B"
                  result['class'] = "bg-warning"
                }
              }else{
                result['exp'] = "RT-A"
                result['class'] = "bg-warning"
              }
            }else{
              result['exp'] = "..."
              result['class'] = ""
            }

          }else{
            result['exp'] = "..."
            result['class'] = "bg-secondary"
          }

        }

        if( logs['j'].in == null && logs['x1'].in == null && logs['x2'].in == null && this.asesorLogs[asesor] != null ){
          for( let log of this.asesorLogs[asesor] ){
            if( moment.tz(log['login'], 'America_Mexico_city').tz('America/Bogota') > moment( `${moment().format('YYYY-MM-DD 06:00:00')}` ) ){
              result['exp'] = "FDH"
              result['class'] = "bg-danger"
              this.listRts( type, asesor, 'fdh' )
            }
          }
        }

      }else{

        if( !flagAus ){

          if( info.in > info['js'].clone().add(1, 'minutes') ){
            if( info.in >= info['js'].clone().add(13, 'minutes') ){
              result['exp'] = "RT-B"
              result['class'] = "bg-warning animated flash infinite"

              this.listRts( type, asesor, 'b' )

              if( this.checkSA( now, info.je, info.out, type, asesor ) ){
                result['exp'] = "RT-B / SA"
                result['class'] = "bg-danger"
              }
            }else{
              result['exp'] = "RT-A"
              result['class'] = "bg-warning"

              this.listRts( type, asesor, 'a' )

              if( this.checkSA( now, info.je, info.out, type, asesor ) ){
                result['exp'] = "RT-A / SA"
                result['class'] = "bg-danger"
              }
            }
          }else{
            result['exp'] = "OK"
            result['class'] = "bg-success"

            if( this.checkSA( now, info.je, info.out, type, asesor ) ){
              result['exp'] = "OK / SA"
              result['class'] = "bg-danger"
            }
          }



        }else{
          result['exp'] = "L-In"
          result['class'] = "bg-success"
        }

      }
    }

    if( type == 'exception' ){
      return result['exp']
    }else{
      if( this.dataExceptions[asesor] ){
        return 'bg-primary text-white'
      }
      return result['class']
    }

  }

  checkSA( now, je, out, type, asesor ){
    if( now > je && moment.tz(this.lu, 'America/Mexico_city').tz("America/Bogota") > je ){
      if( out < je ){

        this.listRts( type, asesor, 'sa' )

        return true
      }
    }

    return false
  }

  compareDates( a, type, b ){

    let x = moment(a), y = moment(b)

    switch(type){
      case "==":
        if( x == y ){
          return true
        }
        break
      case "!=":
        if( x != y ){
          return true
        }
        break
      case ">":
        if( x > y ){
          return true
        }
        break
      case ">=":
        if( x >= y ){
          return true
        }
        break
      case "<":
        if( x < y ){
          return true
        }
        break
      case "<=":
        if( x <= y ){
          return true
        }
        break
    }

    return false

  }

  timerLoad( pause = false ){

    if(this.killProcess){
      return true
    }

    if( this.timerFlag ){
      if( this.timeCount == 0 ){
        this.loopCount--

        if( this.loopCount == 0 ){
          this.getSchedules()
        }else{
          this.getLogs()
        }
      }else{
        this.timeCount--
      }
    }

    setTimeout( () => {
      this.timerLoad()
    }, 1000 )

  }

  showrts(){
    console.log(this.dataExceptions)
  }

  containsObject(val, compare, list) {
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i][compare] == val) {
            return true;
        }
    }

    return false;
  }

  listRts( type, asesor, rt ){
    if( type == 'exception' ){
      let obj = { id: asesor, name: this.dataPerHour[this.asesorIndex[asesor].h][this.asesorIndex[asesor].k].nombre }
      if( !this.containsObject( asesor, 'id', this.rets[rt] ) ){
          this.rets[rt].push(obj)
      }
    }
    console.log(type, this.rets)
  }

  popOv( asesor, open ){
    this.popOvers[asesor] = open
    // console.log(this.popOvers)

    for(let i in this.popOvers ){
      if( this.popOvers[i] ){
        this.timerFlag = false
        return true
      }
    }

    setTimeout( () => {
      this.timerFlag = true
      return true
    }, 1000)
  }

  popTimer( event ){
    this.popOvers[event.asesor] = event.status
    let flag = true

    for( let pops in this.popOvers ){
      if( this.popOvers[pops] ){
        flag = false
      }
    }

    this.timerFlag = flag
  }

  excStatus( event ){
    if( !event.status ){
      let error = event.error.json()
      this.toastr.error( error.msg, `Error ${event.error.status} - ${event.error.statusText}` )

      if( error.Existente ){
        console.error("Ausentismo existente: ", error.Existente)
      }

      if( error.errores ){
        console.error("Ausentismo existente: ", error.errores)
      }
    }else{
      this.toastr.success( event.error.msg, `Guardado` )
      this.getLogs()

    }
  }


}

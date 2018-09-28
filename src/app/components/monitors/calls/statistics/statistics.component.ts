import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../../globals';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<any> {

  fromModel(date: string): NgbDateStruct {

    let tmp = new Date(parseInt(moment(date).format('YYYY')), parseInt(moment(date).format('MM')), parseInt(moment(date).format('DD')))

    return (date && tmp.getFullYear) ? {year: tmp.getFullYear(), month: tmp.getMonth(), day: tmp.getDate()} : null;
  }

  toModel(date: NgbDateStruct): string {
    // return date ? new Date(date) : null;
    return date ? moment({year: date.year, month: date.month - 1, day:date.day}).format('YYYY-MM-DD') : null;
  }
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styles: [`
    .custom-day {
      text-align: center;
      padding: 0.185rem 0.25rem;
      display: inline-block;
      height: 2rem;
      width: 2rem;
    }
    .custom-day.focused {
      background-color: #e6e6e6;
    }
    .custom-day.range, .custom-day:hover {
      background-color: rgb(2, 117, 216);
      color: white;
    }
    .custom-day.faded {
      background-color: rgba(2, 117, 216, 0.5);
    }
  `],
  // providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class StatisticsComponent implements OnInit, OnDestroy {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'monitor_participacion_cc'

  timeout:any

  startDate:any
  dateSelected:any

  loading:Object = {}
  total:any
  aht:any
  monitor:boolean = true
  data:any
  locs:any
  dataH:Object = {}
  date:any
  dids:any
  lu:any
  luLocs:any
  reload=false

  skill:number = 35
  skills:any

  timerFlag:boolean= false
  timeCount:number= 300

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct
  groupBy:any = 'hora'

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                private completerService:CompleterService,
                private _zh:ZonaHorariaService,
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

    this.getSkills()

    this.setToday()

    jQuery('#picker').val(`${moment(this.inicio).format('DD/MM')} a ${moment(this.fin).format('DD/MM')}`)

  }

  setToday(){
    this.dateSelected = moment().subtract(0,'days').format('YYYY-MM-DD')
    this.startDate = {
      year: parseInt(moment().subtract(0,'days').format('YYYY')),
      month: parseInt(moment().subtract(0,'days').format('MM')),
      day: parseInt(moment().subtract(0,'days').format('DD'))
    }
  }

  ngOnInit() {
    setTimeout( () => { this.chgDate( true ) }, 1500 )

  }

  ngOnDestroy() {
    clearTimeout(this.timeout)

  }

  chgDep( skill ){
    this.skill = skill
    this.chgDate( this.monitor )
  }

  getSkills(){
    this._api.restfulGet( '', 'VentaMonitor/inDeps')
              .subscribe( res => {
                this.skills = {}
                for( let skill of res['data'] ){
                  this.skills[skill['skill']]= {Dep: skill['Departamento']}
                }

              }, err => {
                console.log('ERROR', err)

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }


  getData( td:boolean = true ){
    this.loading['data'] = true
    let flag = false

    if( td ){
      this.setToday()
      flag = true
    }

    let params = {
      date: this.dateSelected,
      end: this.fin,
      skill: this.skill,
      groupBy: this.groupBy
    }

    this.timerFlag = false

    this._api.restfulPut( params, 'VentaMonitor/callStats')
              .subscribe( res => {

                this.loading['data'] = false

                this.reload = true

                let calls = []
                let groups = {}
                this.total = {
                  contestadas: 0,
                  abandonadas: 0,
                  IN: 0,
                  PDV: 0,
                  Mixcoac: 0,
                  ofrecidas: 0
                }

                for( let call of res['data'] ){

                  this.total['ofrecidas'] += parseInt(call['calls'])

                  if( call['Grupo'] == 'Abandon'){
                    this.total['abandonadas'] += parseInt(call['calls'])
                  }else{
                    this.total['contestadas'] += parseInt(call['calls'])
                    switch(call['Grupo']){
                      case 'IN':
                        this.total['IN'] += parseInt(call['calls'])
                        break
                      case 'PDV':
                        this.total['PDV'] += parseInt(call['calls'])
                        break
                      case 'Mixcoac':
                        this.total['Mixcoac'] += parseInt(call['calls'])
                        break
                    }
                  }

                  if( !groups[call['Grupo']] ){
                    groups[call['Grupo']] = {
                      name: call['Grupo'],
                      data: [[parseInt(this.unixTime(call['H'])), parseInt(call['calls'])]],
                      aht:  [[parseInt(this.unixTime(call['H'])), parseFloat(call['AHT'])]]
                    }
                  }else{
                    groups[call['Grupo']]['data'].push([parseInt(this.unixTime(call['H'])), parseInt(call['calls'])])
                    groups[call['Grupo']]['aht'].push([parseInt(this.unixTime(call['H'])), parseFloat(call['AHT'])])
                  }
                }

                for( let call of res['forecast'] ){

                  this.total['forecast'] += parseInt(call['calls'])

                  if( !groups['Forecast'] ){
                    groups['Forecast'] = {
                      name: 'Forecast',
                      data: [[parseInt(this.unixTime(call['hora'])), parseInt(call['calls'])]]
                    }
                  }else{
                    groups['Forecast']['data'].push([parseInt(this.unixTime(call['hora'])), parseInt(call['calls'])])
                  }
                }

                this.data = { Abandon : { name  : 'Abandon',
                                          color : '#870000',
                                          data  : groups['Abandon'] ? groups['Abandon']['data'] : []
                                        },
                              PDV     : { name  : 'PDV',
                                          color : '#008bd1',
                                          data  : groups['PDV'] ? groups['PDV']['data'] : [],
                                          aht   : groups['PDV'] ? groups['PDV']['aht'] : []
                                        },
                              IN      : { name  : 'IN',
                                          color : '#0f7500',
                                          data  : groups['IN'] ? groups['IN']['data'] : [],
                                          aht   : groups['IN'] ? groups['IN']['aht'] : []
                                        },
                              Mixcoac : { name  : 'Mixcoac',
                                          color : '#a78116',
                                          data  : groups['Mixcoac'] ? groups['Mixcoac']['data'] : [],
                                          aht   : groups['Mixcoac'] ? groups['Mixcoac']['aht'] : []
                                        },
                              Forecast: { name  : 'Forecast',
                                          color : '#f442ce',
                                          data  : groups['Forecast'] ? groups['Forecast']['data'] : []
                                        },
                              }

                console.log(this.data)
                this.date = this.dateSelected
                this.lu = res['lu']

                this.reload = false

                if( flag ){
                  this.timerFlag = true
                  this.timeCount = 300
                  this.timerLoad()
                }else{
                  this.timerFlag = false
                }

              }, err => {
                console.log('ERROR', err)

                this.timerFlag = true
                this.timeCount = 30
                this.timerLoad()

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getPast( date, group, end? ){
    this.loading['data'] = true

    let params = {
      date: moment(this.inicio).subtract(group == 'ly' ? 364 : 7, 'days').format('YYYY-MM-DD'),
      dateEnd: moment(this.fin).subtract(group == 'ly' ? 364 : 7, 'days').format('YYYY-MM-DD'),
      skill: this.skill,
      groupBy: this.groupBy
    }

    this._api.restfulPut( params, 'VentaMonitor/callStatsH')
              .subscribe( res => {

                this.loading['data'] = false

                this.dataH[group] = {
                  name: group,
                  // color: color,
                  data: [],
                  type: 'line'
                }

                let d

                switch( group ){
                  case 'ly':
                    d = 364
                    break
                  case 'lw':
                    d = 7
                    break
                }

                for( let h of res['data'] ){
                  this.dataH[group]['data'].push([parseInt(this.unixTime(moment(h['H']).add(d, 'days').format('YYYY-MM-DD HH:mm:ss'))), parseInt(h['calls'])])
                }

                console.log(this.dataH)
                if( group == 'ly' ){
                  this.getPast( moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD'), 'lw' )
                }

                if( group == 'lw' ){
                  this.getData( this.monitor )
                }



              }, err => {
                console.log('ERROR', err)

                this.timerFlag = true
                this.timeCount = 30
                this.timerLoad()

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  chgDate( flag = false ){
    this.dateSelected = this.inicio
    if( flag ){
      this.groupBy ='hora'
      this.dateSelected = moment().format('YYYY-MM-DD')
      this.inicio = moment().format('YYYY-MM-DD')
      this.fin = moment().format('YYYY-MM-DD')
      this.getPast( moment().subtract(364, 'days').format('YYYY-MM-DD'), 'ly' )
    }else{
      this.getPast( moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'ly' )
    }
  }

  timerLoad( pause = false ){

    if( this.timerFlag ){
      if( this.timeCount == 0 ){

        this.getData()

      }else{
        if( this.timeCount > 0){
          this.timeCount--
          this.timeout = setTimeout( () => {
          this.timerLoad()
          }, 1000 )
        }
      }
    }else{
      if( pause ){
        setTimeout( () => {
        this.timerLoad( true )
        }, 1000 )
      }
    }
  }

  refresh( event, tipo ){
    switch( tipo ){
      case 'live':
        this.dateSelected = moment().format('YYYY-MM-DD')
        this.chgDate( event )
        break
    }

  }

  unixTime( time ){
    // DEFINE UNIX TIME
    let m = moment.tz(`${ time }`, 'America/Mexico_city')
    let local = m.clone().tz( this._zh.zone )
    let dif = moment(m.format('YYYY-MM-DD HH:mm:ss')).diff(local.format('YYYY-MM-DD HH:mm:ss'), 'hours')
    m.subtract((5+(dif*(-1))), 'hours')
    return m.format('x')
  }

  isToday( date ){
    if( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
      return 'bg-success text-light'
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
    } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals(date, this.fromDate))) {
      this.toDate = date
      this.fin = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).format('DD/MM')} a ${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')}`)
      el.close()
      this.dateSelected = this.inicio
      this.getPast( moment(this.fin).subtract(364, 'days').format('YYYY-MM-DD'), 'ly' )
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
      this.fin = null
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  chgGB( type ){
    this.groupBy = type
    this.getPast( moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'ly' )
  }

  printTime( time, format ){
    return moment.tz(time, 'America/Mexico_city').tz( this._zh.zone ).format( format )
  }

}

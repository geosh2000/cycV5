import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, Injectable, Input } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

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
  selector: 'app-call-statistics',
  templateUrl: './call-statistics.component.html',
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
  export class CallStatisticsComponent implements OnInit, OnDestroy {

  @Input() skill:number = 35
  @Input() multi:boolean = false
  @Input() phase:number = 0
  @Input() dt:any

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

  skills:any = []
  skillSelected:any

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
    setTimeout( () => { this.chgDate( true ) }, 1500+(this.phase*1000) )

  }

  ngOnDestroy() {
    clearTimeout(this.timeout)

  }

  chgDep( skill, name ){
    this.skill = skill
    this.skillSelected = name
    this.chgDate( this.monitor )
  }

  getSkills(){
    this._api.restfulGet( '0/1', 'Lists/depList')
              .subscribe( res => {

                this.skills = res['data']

                for( let item of res['data']){
                  if(parseInt(item['id']) == this.skill){
                    this.chgDep( this.skill, item['Departamento'] )
                  }
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
      inicio: this.inicio,
      fin: this.fin,
      skill: this.skill,
      groupBy: this.groupBy
    }

    this.timerFlag = false

    this._api.restfulPut( params, 'Queuemetrics/callStats')
              .subscribe( res => {

                this.loading['data'] = false

                this.reload = true

                let calls = []
                let groupsH = {
                  lw: {
                    name: 'lw',
                    data: [],
                    type: 'line'
                  },
                  ly: {
                    name: 'ly',
                    data: [],
                    type: 'line'
                  }
                }
                let groups = { Abandon : { name  : 'Abandon',
                                          color : '#870000',
                                          data  : []
                                        },
                              PDV     : { name  : 'PDV',
                                          color : '#008bd1',
                                          data  : [],
                                          aht   : []
                                        },
                              IN      : { name  : 'IN',
                                          color : '#0f7500',
                                          data  : [],
                                          aht   : []
                                        },
                              Mixcoac : { name  : 'Mixcoac',
                                          color : '#a78116',
                                          data  : [],
                                          aht   : []
                                        },
                              Forecast: { name  : 'Forecast',
                                          color : '#f442ce',
                                          data  : []
                                        },
                              }
                this.total = {
                  contestadas: parseInt(res['data']['total']['Answered']),
                  abandonadas: parseInt(res['data']['total']['Abandoned']),
                  IN: parseInt(res['data']['total']['main']),
                  PDV: parseInt(res['data']['total']['PDV']),
                  Mixcoac: parseInt(res['data']['total']['apoyo']),
                  ofrecidas: parseInt(res['data']['total']['Offered']),
                  sla20: parseInt(res['data']['total']['sla20']),
                  sla30: parseInt(res['data']['total']['sla30']),
                }

                // TD
                for( let call of res['data']['td'] ){
                  groups['Abandon']['data'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['Abandoned'])])
                  groups['PDV']['data'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['PDV'])])
                  groups['PDV']['aht'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['AHT_pdv'])])
                  groups['IN']['data'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['main'])])
                  groups['IN']['aht'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['AHT_main'])])
                  groups['Mixcoac']['data'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['apoyo'])])
                  groups['Mixcoac']['aht'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['AHT_apoyo'])])
                  // console.log(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'), parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))))
                }

                // LW
                for( let call of res['data']['lw'] ){
                  groupsH['lw']['data'].push([parseInt(this.unixTime(moment(moment.tz(call['H'],'America/Mexico_city').add(7, 'days').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['Offered'])])
                }

                // LY
                for( let call of res['data']['ly'] ){
                  groupsH['ly']['data'].push([parseInt(this.unixTime(moment(moment.tz(call['H'],'America/Mexico_city').add(364, 'days').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['Offered'])])
                }

                // Forecast
                for( let call of res['data']['forecast'] ){
                  groups['Forecast']['data'].push([parseInt(this.unixTime(moment.tz(call['H'],'America/Mexico_city').tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))), parseInt(call['Offered'])])
                }

                this.data = groups
                this.dataH = groupsH

                // console.log(this.data)
                // console.log(this.dataH)
                this.date = this.inicio != this.fin ? `${moment(this.inicio).format('DD MMM \'YY')} a ${moment(this.fin).format('DD MMM \'YY')}` : moment(this.inicio).format('DD MMM \'YY')
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
    if(this.timerFlag){
      this.timeCount=0
    }else{
      this.getData()
    }
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

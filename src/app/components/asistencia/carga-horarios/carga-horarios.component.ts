import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { ContextMenuComponent } from 'ngx-contextmenu';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-carga-horarios',
  templateUrl: './carga-horarios.component.html',
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
  `]
})
export class CargaHorariosComponent implements OnInit {

  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

  mainCredential: any = 'sch'
  showContents: boolean;
  currentUser: any;

  loading:Object = {}

  horaCun:boolean = false
  filterExpanded:boolean = false
  selectedAsesores:any = []

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct

  listScheds:any
  listDates:any

  selectedHIds:any = []

  optH:Object = {
    cc8: {
            m: [ ['00:00', '07:00'], ['06:00', '14:00'], ['06:30', '14:30'], ['07:00', '15:00'], ['07:30', '15:30'], ['08:00', '16:00'], ['08:30', '16:30'], ['09:00', '17:00'], ['09:30', '17:30'], ['10:00', '18:00'], ['10:30', '18:30'], ['11:00', '19:00'], ['11:30', '19:30'] ],
            v: [ ['12:00', '20:00'], ['12:30', '20:30'], ['13:30', '21:00'], ['14:00', '21:30'], ['14:30', '22:00'], ['15:00', '22:30'], ['15:30', '23:00'], ['16:00', '23:30'], ['17:00', '00:00'], ['17:30', '00:30'], ['18:00', '01:00'], ['18:30', '01:30'], ['19:00', '02:00'], ['19:30', '02:30'], ['20:00', '03:00'], ['23:30', '06:00'] ]
          },
    sc8: {
            m: [ ['00:00', '06:30'], ['05:00', '12:30'], ['05:30', '13:00'], ['06:00', '13:30'], ['06:30', '14:00'], ['07:00', '14:30'], ['07:30', '15:00'], ['08:00', '15:30'], ['08:30', '16:00'], ['09:00', '16:30'], ['09:30', '17:00'], ['10:00', '17:30'], ['10:30', '18:00'], ['11:00', '18:30'], ['11:30', '19:00'] ],
            v: [ ['12:00', '19:30'], ['12:30', '20:00'], ['13:30', '20:30'], ['14:00', '21:00'], ['14:30', '21:30'], ['15:00', '22:00'], ['15:30', '22:30'], ['16:00', '23:00'], ['17:00', '23:30'], ['17:30', '00:00'], ['18:00', '00:30'], ['18:30', '01:00'], ['19:00', '01:30'], ['19:30', '02:00'], ['20:00', '02:30'], ['23:30', '06:00'] ]
          }
  }

  constructor(
              private _api:ApiService,
              private _init:InitService,
              private titleService: Title,
              private _tokenCheck:TokenCheckService,
              public toastr: ToastrService
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
                    .subscribe( res => {

                      if( res.status ){
                        this.showContents = this._init.checkCredential( this.mainCredential, true )
                      }else{
                        this.showContents = false
                      }
                    })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Carga de Horarios');
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

  getSchedules(){

    this.loading['schedules'] = true

    let params = {
      asesores: this.selectedAsesores,
      inicio: this.inicio,
      fin: this.fin
    }

    this._api.restfulPut( params, 'Asistencia/schedulesEditList' )
              .subscribe( res => {

                this.loading['schedules'] = false
                this.listScheds = {}

                let data = res['data']
                let list = {}

                for( let item of data ){
                  if( list[item['asesor']] ){
                    list[item['asesor']][item['Fecha']] = {
                                                            sel: false,
                                                            change: false,
                                                            data: item
                                                          }
                  }else{
                    list[item['asesor']] = {
                      [item['Fecha']]: {
                        sel: false,
                        change: false,
                        data: item
                      },
                      Nombre: item['Nombre']
                    }
                  }
                }

                this.listDates = []
                for( let i = moment(this.inicio); i <= moment(this.fin); i.add(1, 'days') ){
                  this.listDates.push( i.format('YYYY-MM-DD') )
                }

                // tslint:disable-next-line:forin
                for( let asesor in list ){
                  for( let date of this.listDates ){
                    if( !list[asesor][date] ){
                      list[asesor][date] = { sel: false, change: false }
                    }
                  }
                }

                this.listScheds = list

              }, err => {
                console.log('ERROR', err)

                this.loading['schedules'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  printMoment( val, format ){
    if( this.horaCun ){
      return moment.tz(val, 'America/Mexico_city').tz('America/Bogota').format(format)
    }else{
      return moment(val).format(format)
    }
  }

  selectH( asesor, date, skip = false ){

    if( !skip ){
      this.listScheds[asesor][date]['sel'] = !this.listScheds[asesor][date]['sel']
    }

    let flag = this.listScheds[asesor][date]['sel']

    if( flag ){
      this.selectedHIds.push( { asesor: asesor, date: date, id: this.listScheds[asesor][date]['data']['id'] } )
    }else{
      let index = this.findId( this.listScheds[asesor][date]['data']['id'] )
      if( index >= 0 ){
        this.selectedHIds.splice( index, 1 )
      }
    }
  }

  findId( id ){
    let i = 0
    for( let item of this.selectedHIds ){
      if( item['id'] == id ){
        return i
      }
      i++
    }

    return -1
  }

  quickSet( type, arr = this.selectedHIds, i?, e? ){
    for( let item of arr ){
      switch( type ){
        case 'descanso':
          this.listScheds[item['asesor']][item['date']]['data']['js'] = `${item['date']} 00:00:00`
          this.listScheds[item['asesor']][item['date']]['data']['je'] = `${item['date']} 00:00:00`
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['cs'] = null
          this.listScheds[item['asesor']][item['date']]['data']['ce'] = null
          this.listScheds[item['asesor']][item['date']]['change'] = true
          break
        case 'xdelete':
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          this.listScheds[item['asesor']][item['date']]['change'] = true
          break
        case 'jSE':
          this.listScheds[item['asesor']][item['date']]['data']['js'] = `${item['date']} ${i}:00`
          this.listScheds[item['asesor']][item['date']]['data']['je'] = `${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          break
        case 'qX1':
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = i > 0 ? this.listScheds[item['asesor']][item['date']]['data']['je'] : `${moment(this.listScheds[item['asesor']][item['date']]['data']['js']).subtract(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}`
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = i > 0 ? `${moment(this.listScheds[item['asesor']][item['date']]['data']['je']).add(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}` : this.listScheds[item['asesor']][item['date']]['data']['js']
          break
        case 'qX2':
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = i > 0 ? this.listScheds[item['asesor']][item['date']]['data']['je'] : `${moment(this.listScheds[item['asesor']][item['date']]['data']['js']).subtract(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}`
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = i > 0 ? `${moment(this.listScheds[item['asesor']][item['date']]['data']['je']).add(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}` : this.listScheds[item['asesor']][item['date']]['data']['js']
          break
      }
    }
  }

  quickSel( flag ){
    // tslint:disable-next-line:forin
    for( let asesor in this.listScheds ){
      for( let item of this.listDates ){
        this.listScheds[asesor][item]['sel'] = flag
        this.selectH( asesor, item, true )
      }
    }
  }
}

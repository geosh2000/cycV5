import { Component, OnInit, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { OrderPipe } from 'ngx-order-pipe';

@Component({
  selector: 'app-reporte-afiliados',
  templateUrl: './reporte-afiliados.component.html',
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
  providers: [ CurrencyPipe, DecimalPipe ]
})
export class ReporteAfiliadosComponent implements OnInit {

  mainCredential: any = 'afiliados'
  showContents: boolean;
  currentUser: any;

  afiliado:any

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct

  loading:Object = {}
  report:any
  listReps:any
  reportData:any
  totals:any
  shownAf:any
  currency:any = 'MXN'

  constructor(
              private _api:ApiService,
              private _init:InitService,
              private titleService: Title,
              private _tokenCheck:TokenCheckService,
              private _order:OrderPipe,
              public toastr: ToastrService, private _cur: CurrencyPipe, private _dec: DecimalPipe
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
    this.titleService.setTitle('CyC - Reporte Afiliados');
    jQuery('#picker').val(`${moment(this.inicio).format('DD/MM')} a ${moment(this.fin).format('DD/MM')}`)
    this.getReportList()
  }

  selectedReport( value ){
    this.shownAf = this.listReps[ value ]['afiliado']
    this.report = this.listReps[ value ]['id']
    this.currency = this.listReps[ value ]['currency']
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

  getReportList(){
    this.loading['list'] = true

    this._api.restfulGet( '', 'Afiliados/afiliadosList' )
              .subscribe( res => {

                this.loading['list'] = false
                this.listReps = this._order.transform(res['data'], 'afiliado')

              }, err => {
                console.log('ERROR', err)

                this.loading['list'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getReport(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.report}/${this.inicio}/${this.fin}/${this.currency}`, 'Afiliados/reporte' )
              .subscribe( res => {

                this.loading['data'] = false
                this.reportData = res['data']
                this.totals = res['total']
                this.afiliado = this.shownAf
                this.titleService.setTitle(`CyC - Reporte ${ this.shownAf }`)

              }, err => {
                console.log('ERROR', err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  printVal( field, item ){
    switch(field){
      case 'MontoIn':
      case 'MontoOut':
      case 'MontoOnline':
      case 'MontoCC':
      case 'MontoAll':
      case 'AvTktIn':
      case 'AvTktOut':
      case 'AvTktOnline':
      case 'AvTktCC':
      case 'AvTktAll':
        return this._cur.transform(item[field], this.currency,'symbol-narrow','.2-2')
      case 'SLA':
      case 'FC':
      case 'Abandon':
        return this._dec.transform(item[field] * 100,'.2-2') + '%'
      case 'AHT':
      case 'ASA':
        return this._dec.transform(item[field],'.2-2') + ' seg'
      case 'TT':
      case 'Total_Espera':
        return this._dec.transform(item[field] / 60 / 60,'.2-2') + ' hrs'
      case 'Fecha':
        return item[field] == 'Total' ? 'Total' : moment(item[field]).format('DD MMM \'YY')
      default:
        return item[field]
    }
  }

  download( id, title ){
    this.toXls( id, title )
  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

}

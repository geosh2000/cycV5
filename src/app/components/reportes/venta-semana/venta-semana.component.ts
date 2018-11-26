import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';
import { Columns } from 'ngx-easy-table/src/app/ngx-easy-table';

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
  selector: 'app-venta-semana',
  templateUrl: './venta-semana.component.html',
  styles: []
})
export class VentaSemanaComponent implements OnInit {

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: 'left'
  }

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  listFlag:boolean = false
  large:boolean = true
  mainCredential:string = 'tablas_f'

  loading:Object = {}
  saving:boolean = false
  vacantesList:any
  listProfiles:any
  selectedVac:any []
  selectVacIndex:Object = {}
  data:any = []

  resetFlag:any
  resetVac:any

  dateSelected:any = moment().format('YYYY-MM-DD')
  paisSelected:any = 'MX'

  results:any = []
  summary:Object = {}
  timeout:any

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct

  porPdv:boolean = false
  porPdvDisplay:boolean = false

  config:EasyTableServiceService
  columns:Columns[] = [
    { key: 'FechaOk', title: 'Fecha' },
    { key: 'pais', title: 'Pais' },
    { key: 'PDV', title: 'PDV' },
    { key: 'Zona', title: 'Zona' },
    { key: 'gpoTipoRsva', title: 'gpoTipoRsva' },
    { key: 'Hotel', title: 'Hotel' },
    { key: 'hotelId', title: 'hotelId' },
    { key: 'placeId', title: 'placeId' },
    { key: 'Destination', title: 'Destination' },
    { key: 'Anio', title: 'Año' },
    { key: 'Semana', title: 'Semana' },
    { key: 'MLs', title: 'MLs' },
    { key: 'RN', title: 'RN' }
  ]

  columnsCopy: Columns[] = [];
  checked = new Set(['FechaOk','pais','gpoTipoRsva','Hotel','hotelId','placeId','Destination','Anio','Semana','PDV','Zona','MLs','RN']);

  constructor(public _api: ApiService,
      public _init:InitService,
      private titleService: Title,
      private _tokenCheck:TokenCheckService,
      public toastr: ToastrService) {

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

    moment.locale('es-MX')

    this.columnsCopy = JSON.parse(JSON.stringify(this.columns));

  }

  ngOnInit() {
    this.config =  EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true
    this.titleService.setTitle('CyC - Venta por Semanas MP');
  }

  setVal( val ){
    this.dateSelected = val.format('YYYY-MM-DD')
  }

  toggle(name: string, value: boolean): void {
    value ? this.checked.add(name) : this.checked.delete(name);
    this.columns = this.columnsCopy.filter((column) => this.checked.has(column.key));
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.paisSelected}/${this.inicio}/${this.fin}/${this.porPdv ? 1 : 0}`, 'Venta/weekSale' )
            .subscribe( res => {

              this.loading['data'] = false

              this.data = res['data']
              this.porPdvDisplay = res['pdvGroup'] == 1 ? true : false

              this.toggle('PDV', this.porPdvDisplay )
              this.toggle('Zona', this.porPdvDisplay )
              this.toggle('Anio', !this.porPdvDisplay )
              this.toggle('Semana', !this.porPdvDisplay )

              console.log(res)
            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  printDate( date, format ){
    return moment(date).format(format)
  }

  downloadXLS(){
    let wb:any

    wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push(this.dateSelected);
    wb.Sheets[this.dateSelected] = utils.json_to_sheet(this.data, {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${this.dateSelected}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
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

}

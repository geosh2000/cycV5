import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

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

  config:EasyTableServiceService
  columns:any = [
    { key: 'Fecha', title: 'Fecha' },
    { key: 'pais', title: 'Pais' },
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

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.paisSelected}/${this.dateSelected}`, 'Venta/weekSale' )
            .subscribe( res => {

              this.loading['data'] = false

              this.data = res['data']

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

}

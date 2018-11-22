import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

@Component({
  selector: 'app-lost-calls',
  templateUrl: './lost-calls.component.html',
  styles: []
})
export class LostCallsComponent implements OnInit {

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
  mainCredential:string = 'lostCalls_view'

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

  results:any = []
  summary:Object = {}
  timeout:any
  selPais:any = 'CO'

  config:EasyTableServiceService
  columns:any = [
    { key: 'Hora', title: 'Hora' },
    { key: 'Llamante', title: 'Llamante' },
    { key: 'Cola', title: 'Cola' },
    { key: 'Espera', title: 'Tiempo de Espera' },
  ]

  constructor(public _api: ApiService,
      public _init:InitService,
      private titleService: Title,
      private _tokenCheck:TokenCheckService,
      private _zh:ZonaHorariaService,
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
    this.config['rows'] = 50
    this.config['paginationRangeEnabled'] = true

    this.getData();

    this.titleService.setTitle('CyC - Llamadas Abandonadas');
  }

  setVal( val ){
    this.dateSelected = val.format('YYYY-MM-DD')
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.dateSelected}/${this.selPais}`, 'Queuemetrics/lostCalls' )
            .subscribe( res => {

              this.loading['data'] = false
              let data = res['data']

              this.data = data

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
    return moment.tz(date, 'America/Mexico_city').tz(this._zh.zone).format(format)
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

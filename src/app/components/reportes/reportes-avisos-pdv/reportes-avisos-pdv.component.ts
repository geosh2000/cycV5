import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

declare var jQuery:any;
// import { json2excel } from 'json2excel';
import * as moment from 'moment-timezone';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

@Component({
  selector: 'app-reportes-avisos-pdv',
  templateUrl: './reportes-avisos-pdv.component.html',
  styles: [],
  providers: [ EasyTableServiceService ],
})
export class ReportesAvisosPdvComponent implements OnInit {

  config:EasyTableServiceService
  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'avisos_pdv_consulta'

  loading:Object = {}

  searchStart:any
  searchEnd:any

  data:any = []
  displayedColumns:any = [];

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
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
    this.titleService.setTitle('CyC - Consulta Avisos PDV');
    this.config =  EasyTableServiceService.config
  }

  dateChange( start, end ){

    this.searchStart = start.format('YYYY-MM-DD')
    this.searchEnd = end.format('YYYY-MM-DD')

    jQuery('#datepicker').val(`${start.format('DD MMM \'YY')} - ${end.format('DD MMM \'YY')}`)
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.searchStart}/${this.searchEnd}`, 'Navbar/avisosPdvReport' )
            .subscribe( res => {

              this.loading['data'] = false
              this.data = res['data']

              let dc = []
              // tslint:disable-next-line:forin
              for( let field in res['data'][0] ){
                dc.push({ key: field, title: field })
              }

              this.displayedColumns = dc

            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)
            })
  }

  exportToExcel() {
    this.toXls( `AvisosPDV_${this.searchStart}a${this.searchEnd}` )
  }

  toXls( title ){

    let wb: WorkBook = { SheetNames: ['Avisos PDV'], Sheets: {} };

    wb.Sheets['Avisos PDV'] = utils.json_to_sheet(this.data, {cellDates: true});

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

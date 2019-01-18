import { Component, OnInit, ViewChild } from '@angular/core';
import { DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';
import { Columns } from 'ngx-easy-table/lib';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

@Component({
  selector: 'app-cuartiles-v2',
  templateUrl: './cuartiles-v2.component.html',
  styles: []
})
export class CuartilesV2Component implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  currentUser:any

  isBo:boolean = false

  searchStart:any
  searchEnd:any

  loading:Object = {}

  pcrcList:any
  pcrcSelected:any
  par:Object = {
    SV: true,
    Paq: false
  }

  cData:any
  cSes:any
  allData:any
  builtData:any
  skill:any

  tableConfig

  params = {}

  // Easy Table
  columns = [
    { key: 'asesor', title: 'idAsesor', type: 'default' },
    { key: 'Nombre', title: 'Nombre', type: 'default' },
    { key: 'Puesto', title: 'Puesto', type: 'default' },
    { key: 'Supervisor', title: 'Supervisor', type: 'default' },
    { key: 'Monto', title: 'Monto Total', type: 'ammount' },
    { key: 'Q_Monto', title: 'Q Monto Total', type: 'def' },
    { key: 'Hotel', title: 'Monto Hotel', type: 'ammount' },
    { key: 'Q_Hotel', title: 'Q Monto Hotel', type: 'def' },
    { key: 'Transfer', title: 'Monto Transfer', type: 'ammount' },
    { key: 'Q_Transfer', title: 'Q Monto Transfer', type: 'def' },
    { key: 'Tour', title: 'Monto Tour', type: 'ammount' },
    { key: 'Q_Tour', title: 'Q Monto Tour', type: 'def' },
    { key: 'LocsIn', title: 'Locs In', type: 'def' },
    { key: 'callsIn', title: 'Calls In', type: 'def' },
    { key: 'FC', title: 'FC', type: 'perc' },
    { key: 'Q_FC', title: 'Q FC', type: 'def' },
    { key: 'ahtIn', title: 'AHT In', type: 'dec' },
    { key: 'Q_ahtIn', title: 'Q AHT In', type: 'def' },
    { key: 'LocsOut', title: 'Locs Out', type: 'def' },
    { key: 'callsOut', title: 'Calls Out', type: 'def' },
    { key: 'ahtOut', title: 'AHT Out', type: 'dec' },
    { key: 'Q_ahtOut', title: 'Q AHT Out', type: 'def' },
    { key: 'intentosOut', title: 'Intentos Out', type: 'def' },
    { key: 'Sesion', title: 'Sesion', type: 'dec' },
    { key: 'Pausas', title: 'Pausas', type: 'dec' },
    { key: 'Utilizacion', title: 'Utilizacion', type: 'perc' },
    { key: 'Q_Utilizacion', title: 'Q Utilizacion', type: 'def' },
    { key: 'casos', title: 'Casos', type: 'default' },
    { key: 'Eficiencia', title: 'Eficiencia (casos por hora)', type: 'dec' },
    { key: 'Q_Eficiencia', title: 'Q Eficiencia', type: 'def' },
    { key: 'PausasExcedidas', title: 'Pausas Excedidas', type: 'default' },
    { key: 'RT', title: 'RT', type: 'default' },
    { key: 'RtDates', title: 'Fechas RT', type: 'default' },
    { key: 'FA', title: 'FA', type: 'default' },
    { key: 'FaDates', title: 'Fechas FA', type: 'default' },
  ];
  columnsCopy = [];
  checked = new Set(['asesor', 'Nombre', 'Supervisor']);
  config

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

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
          }
        })

    moment.locale('es-MX')

    let show = this.par['Paq']
    let t_sh = this.pcrcSelected == 50 ? true : false

    this.config =  EasyTableServiceService.config
    this.config['exportEnabled'] = true
    this.config['paginationEnabled'] = true
    this.config['rows'] = 50
    this.config['paginationRangeEnabled'] = true

    this.columnsCopy = this.columns

    this.getParams()

  }

  ngxToggle(name: string, value: boolean): void {
    value ? this.checked.add(name) : this.checked.delete(name);
    this.columns = this.columnsCopy.filter((column) => this.checked.has(column.key));
  }

  changePcrc( skill ){
    // console.log(skill)
    for( let item of this.pcrcList ){
      if( parseInt(skill) == parseInt(item.dep) ){
        this.isBo = item.isBO == '1' ? true : false
        // console.log( this.isBo )
        return true
      }
    }
  }

  dateChange( start, end ){

    this.searchStart = start.format('YYYY-MM-DD')
    this.searchEnd = end.format('YYYY-MM-DD')

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Cuartiles');
    this.getPcrcs()
  }

  getPcrcs(){
    this.loading['pcrcs'] = true

    this._api.restfulGet( '', 'Cuartiles/pcrcs' )
            .subscribe( res => {

              this.loading['pcrcs'] = false
              this.pcrcList = res['data']


            }, err => {
              console.log('ERROR', err)

              this.loading['pcrcs'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  getParams(){
    this.loading['params'] = true

    this._api.restfulGet( '', 'Cuartiles/param' )
            .subscribe( res => {

              this.loading['params'] = false
              this.params = res['data']


            }, err => {
              console.log('ERROR', err)

              this.loading['params'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  getCuartiles(){

    if( !this.params[this.pcrcSelected] ){
      this.toastr.error( 'No existen parametros definidos para el departamento seleccionado', 'Error' )
      return false
    }

    this.loading['cuartiles'] = true

    let params = this.params[this.pcrcSelected]
    params['inicio'] = this.searchStart
    params['fin'] = this.searchEnd

    this._api.restfulPut( params, `Cuartiles/${ this.params[this.pcrcSelected]['api']}` )
            .subscribe( res => {

              this.loading['cuartiles'] = false
              this.cData = res['data']

              let columns = this.params[this.pcrcSelected]['cols'].split(',')
              // console.log(columns)
              let bool = true
              for( let col of this.columns ){
                if( columns.indexOf(col.title) >= 0 ){
                  bool = true
                }else{
                  bool = false
                }

                this.ngxToggle(col.key, bool)
              }

            }, err => {
              console.log('ERROR', err)

              this.loading['cuartiles'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  downloadXLS( sheets, title, json ){
    let wb:any

    wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push(title);
    wb.Sheets[title] = utils.json_to_sheet(json, {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

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

import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { EasyTableServiceService } from '../../../../services/easy-table-service.service';

import { Title } from '@angular/platform-browser';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-avance-venta-pdv',
  templateUrl: './avance-venta-pdv.component.html',
  styles: []
})
export class AvanceVentaPdvComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'pdv_avancePdv'
  currentUser:any
  loading:Object = {}

  config:EasyTableServiceService
  columns:any = [
    { type: 'default', key: 'Nombre', title: 'Nombre' },
    { type: 'default', key: 'Puesto', title: 'Puesto' },
    { type: 'default', key: 'Supervisor', title: 'Supervisor' },
    { type: 'ammount', key: 'meta_asesor', title: 'Meta Total' },
    { type: 'ammount', key: 'MetaHotel_asesor', title: 'Meta Hotel' }
  ]

  options:Object = {
    meses: [],
    anios: [],
    zones: [],
    views: [
      {val: 'ase', title: 'Asesor'},
      {val: 'sup', title: 'Supervisor'},
      {val: 'zon', title: 'Zona'},
    ]
  }

  indexFile:Object = {
    zona: [],
    super: [],
    pdv: [],
  }
  detAsesor:boolean = false

  nowFlag:any = moment()

  selParams:Object = {
    month: parseInt(moment().format('MM')),
    year: parseInt(moment().format('YYYY')),
    view: 'ase',
    zone: '',
    asesor: ''
  }

  views:Object = {
    'super' : {},
    'pdv' :  {},
    'asesor': {}
  }

  data:Object = {
    zones: [],
    sups: []
  }

  listsData:Object = {
    supers: []
  }

  dataParams:Object = {}

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

      this.buildOpts()
      this.getZones( moment().format('YYYY'), moment().format('MM') )

      moment.locale('es-MX')
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Avance de Venta PDV');
    this.config =  EasyTableServiceService.config
    this.config['exportEnabled'] = true
    this.config['paginationEnabled'] = true
    this.config['rows'] = 50
    this.config['paginationRangeEnabled'] = true
  }

  buildOpts(){
    let curYear = parseInt(moment().format('YYYY'))
    let months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ], years = []

    for( let i = 2018; i <= curYear; i++ ){
      years.push(i)
    }

    this.options['meses'] = months
    this.options['anios'] = years
  }

  onSelectedAsesor(item, field){
    if(item){
      this.selParams[field] = item.asesor
    }
  }

  getZones( year, month ){
    this.loading['zones'] = true

    this._api.restfulGet( `MX/${year}-${month}-01`, 'Lists/pdvZoneCoordList' )
            .subscribe( res => {

              this.loading['zones'] = false

              let data = res['data'], result = []

              for( let zone of data ){
                result.push({id: zone['id'], title: `${zone['PDV']} (${zone['SupervisorName']})`})
              }

              this.options['zones'] = result
            }, err => {
              console.log('ERROR', err)

              this.loading['zones'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })

  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.selParams['month']}/${this.selParams['year']}`, 'Venta/avancePdvMes' )
            .subscribe( res => {

              this.loading['data'] = false

              for( let r of res['data']['zones'] ){
                this.indexFile['zona'].push(r['Zona'])
              }
              for( let r of res['data']['super'] ){
                this.indexFile['super'].push(r['Supervisor'])
                if( this.listsData['supers'].indexOf(r['Supervisor']) < 0 ){
                  this.listsData['supers'].push(r['Supervisor'])
                }
              }

              this.listsData['supers'].sort()


              for( let r of res['data']['pdv'] ){
                this.indexFile['pdv'].push(r['PDV'])
              }

              this.data = res['data']
              this.dataParams = {
                mes: this.selParams['month'],
                anio: this.selParams['year'],
              }
            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })

  }

  tabChange( group, event ){
    this.nowFlag = moment()
  }

  detChange( ev ){
    console.log(ev)
  }

  downloadXLS(){
    let wb:any

    wb = { SheetNames: ['PorPdv', 'PorAsesor'], Sheets: {} };
    wb.Sheets['PorPdv'] = utils.json_to_sheet(this.data['sumAll'], {cellDates: true});
    wb.Sheets['PorAsesor'] = utils.json_to_sheet(this.data['daily'], {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
                      'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `AvanceVentasPdv_${this.selParams['month']}${this.selParams['year']}_${moment().format('YYYYMMDD')}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

}

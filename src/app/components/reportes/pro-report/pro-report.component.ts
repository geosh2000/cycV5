import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { Title } from '@angular/platform-browser';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pro-report',
  templateUrl: './pro-report.component.html',
  styles: []
})
export class ProReportComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  today:any = moment()

  dataRep:any
  presetName:any
  showPName:boolean = false
  presets:any = []
  selectedPreset:any = 0

  apiData:Object
  defaultData:Object = {
    chanGroup : {
                marca       : { status    : true,
                                showCol   : true,
                                groupBy   : false,
                                name      : 'marca',
                                searchType: 'in',
                                params     : ['Marcas Propias']
                              },
                gpoCanalKpi : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'gpoCanalKpi',
                                searchType: 'in',
                                params     : []
                              },
                gpoCanal    : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'gpoCanal',
                                searchType: 'in',
                                params     : []
                              },
                canal       : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'canal',
                                searchType: 'in',
                                params     : []
                              },
                pais        : { status    : true,
                                showCol   : true,
                                groupBy   : false,
                                name      : 'pais',
                                searchType: 'in',
                                params     : ['MX']
                              },
                tipoCanal   : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'tipoCanal',
                                searchType: 'in',
                                params     : []
                              },
              },
    tipoRsva  : {
                tipoRsva    : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'tipoRsva',
                                searchType: 'in',
                                params     : []
                              },
                gpoTipoRsva : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'gpoTipoRsva',
                                searchType: 'in',
                                params     : []
                              },
              },
    fecha     : {
                Fecha       : { status    : true,
                                showCol   : true,
                                groupBy   : true,
                                name      : 'Fecha',
                                searchType: 'between',
                                params     : [moment().subtract(1,'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
                              },
                Hora        : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'Hora',
                                searchType: 'between',
                                params     : ['00:00:00', '23:59:59']
                              },
              },
    itemTypes : {
                servicio    : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'servicio',
                                searchType: 'in',
                                params     : []
                              },
              },
    genGroup  : {
                Asesor      : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'asesor',
                                searchType: 'in',
                                params     : []
                              },
                Stand       : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'branchName',
                                searchType: 'in',
                                params     : []
                              }
              },
    branchId  : {
                branchId      : { status    : false,
                                showCol   : false,
                                groupBy   : false,
                                name      : 'branchId',
                                searchType: 'in',
                                params     : []
                              },
              },
  }

  genPar:Object = {
    isPaq: true,
    outlet: false,
    sv: true,
    loc: false
  }
  opts:Object = {}
  asesores:Object = {}

  // Settings configuration
  selectorSettings: IMultiSelectSettings = {
      enableSearch: true,
      checkedStyle: 'checkboxes',
      buttonClasses: 'btn btn-secondary btn-block',
      dynamicTitleMaxItems: 1,
      displayAllSelectedText: true,
      showCheckAll: true,
      showUncheckAll: true,
      maxHeight:  '300px',
      closeOnClickOutside: true,
      stopScrollPropagation: true
  };

  loading:Object = {
    filter: {}
  }

  isCollapsed:Object = {
    chanGroup: true,
    itemTypes: true,
    tipoRsva: true,
  }

  searchStart:any
  searchEnd:any

  DROptions: any = {
        locale: { format: 'YYYY-MM-DD' },
        timePicker: true,
        timePicker24Hour: true
    };

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
    this.apiData = JSON.parse(JSON.stringify(this.defaultData))
    this.presets.push({ name: '_default', params: JSON.parse(JSON.stringify(this.defaultData)) })
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - ProReports');

    for( let group in this.apiData ){
      for( let field in this.apiData[group] ){
        this.selectorChange(null, group, field, false)
      }
    }

    this.getAsesores()
    this.loadPresets()

  }

  getFiltData( group, field ){
    this.loading['filter'][group] = true

    let params = {
      filters: this.apiData[group],
      field: field
    }

    this._api.restfulPut( params, `Lists/${group}` )
            .subscribe( res => {

              this.loading['filter'][group] = false
              this.opts[field] = res['data']

            }, err => {
              console.log("ERROR", err)

              this.loading['filter'][group] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  getAsesores(){
    this.loading['asesores'] = true

    let credentials:Object = {
      viewAll:  0,
      udn:      0,
      area:     0,
      dep:      0,
      puesto:   0
    }

    this._api.restfulPut( credentials,'Headcount/asesoresList' )
            .subscribe( res => {
              let tmpSups = []
              this.loading['asesores'] = false
              this.opts['asesores'] = res['data']

              let data = {}
              for( let item of res['data'] ){
                data[item['id']]=item
              }

              this.asesores=data

            }, err => {
              console.log("ERROR", err)

              this.loading['asesores'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  getReport(){
    this.loading['report'] = true

    this._api.restfulPut( {data: this.apiData, gen: this.genPar},'Prorep/locs' )
            .subscribe( res => {

              this.loading['report'] = false
              this.dataRep = res['data']

            }, err => {
              console.log("ERROR", err)

              this.loading['report'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  selectorChange(event, group, field, flag=true){

    switch(group){
      case 'chanGroup':
      case 'tipoRsva':
      case 'itemTypes':
      case 'branchId':
        for( let i_field in this.apiData[group] ){
          if( flag ){
            if( i_field != field ){
              this.getFiltData( group, i_field )
            }
          }else{
            this.getFiltData( group, field )
          }
        }
        break

    }

  }

  printAsesores(array, field){
    let result = ''
    for( let id of array ){
      result = `${ result == '' ? '' : result + ','} ${this.asesores[id][field]}`
    }

    return result
  }

  dateChange( start, end ){

    this.apiData['fecha']['Fecha']['params'][0] = start.format("YYYY-MM-DD")
    this.apiData['fecha']['Fecha']['params'][1] = end.format("YYYY-MM-DD")
    this.apiData['fecha']['Hora']['params'][0] = start.format("HH:mm:ss")
    this.apiData['fecha']['Hora']['params'][1] = end.format("HH:mm:ss")

    jQuery('#datepicker').val(`${this.apiData['fecha']['Fecha']['params'][0]} ${this.apiData['fecha']['Hora']['params'][0]} - ${this.apiData['fecha']['Fecha']['params'][1]} ${this.apiData['fecha']['Hora']['params'][1]}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  test(event){
    console.log(event)
  }

  download(){
    let wb:any

    wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push('reporte');
    wb.Sheets['reporte'] = utils.json_to_sheet(this.dataRep, {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `reporte_personalizado.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  chgPar( group, field, tipo ){
    this.apiData[group][field][tipo] = !this.apiData[group][field][tipo]
  }

  savePreset( flag=false, content? ){

    if( flag ){
      this.presetName = ''
      this.showPName = true
    }else{
      this.putPreset( this.apiData )
    }

  }

  putPreset( data ){
    this.loading['savePreset'] = true

    this._api.restfulPut( { params: JSON.stringify(data), name: this.presetName }, 'Prorep/savePreset' )
              .subscribe( res => {

                this.loading['savePreset'] = false
                this.toastr.success( 'Preset Guardado', `Guardado correctamente` )
                this.showPName = false
                this.loadPresets()


              }, err => {
                console.log("ERROR", err)

                this.loading['savePreset'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  loadPresets(  ){
    this.loading['loadPreset'] = true

    this._api.restfulGet( '', 'Prorep/loadPreset' )
              .subscribe( res => {

                this.loading['loadPreset'] = false
                let presets = []
                for(let item of res['data']){
                  presets.push( { name: item['name'], params: JSON.parse(item['val']) } )
                }
                this.presets = presets
                console.log(this.presets)


              }, err => {
                console.log("ERROR", err)

                this.loading['loadPreset'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  selectPreset( index ){
    this.selectedPreset = index
    this.apiData = JSON.parse(JSON.stringify(this.presets[index]['params']))
  }

}

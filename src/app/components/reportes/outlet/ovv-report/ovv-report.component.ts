import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { Title } from '@angular/platform-browser';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';
import { EasyTableServiceService } from '../../../../services/easy-table-service.service';
import { Columns } from 'ngx-easy-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-ovv-report',
  templateUrl: './ovv-report.component.html',
  styles: []
})
export class OvvReportComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  today:any = moment()

  dataRep:any
  presetName:any
  showPName:boolean = false
  presets:any = []
  selectedPreset:any = 'Preset'

  colType:Object = {
    Localizador: 'text',
    Fecha: 'date',
    Hora: 'time',
    pais: 'text',
    marca: 'text',
    gpoCanal: 'text',
    tipoCanal: 'text',
    gpoCanalKpiOk: 'text',
    Sucursal: 'text',
    NombreAsesor: 'text',
    servicio: 'text',
    Monto: 'currency',
    RN: 'number',
    tipoRsva: 'text',
    gpoTipoRsva: 'text',
    HotelOk: 'text',
    CorporativoOk: 'text',
    DestinationOk: 'text',
  }

  config:EasyTableServiceService
  columns:Columns[] = [
    { key: 'Localizador',  title: 'Localizador' },
    { key: 'Fecha',        title: 'Fecha' },
    { key: 'Hora',         title: 'Hora' },
    { key: 'pais',         title: 'Pais' },
    { key: 'marca',        title: 'Marca' },
    { key: 'gpoCanal',     title: 'Grupo Canal' },
    { key: 'tipoCanal',    title: 'Tipo Canal' },
    { key: 'gpoCanalKpiOk',title: 'Grupo KPI' },
    { key: 'Sucursal',     title: 'Sucursal' },
    { key: 'NombreAsesor', title: 'Asesor' },
    { key: 'servicio',     title: 'Servicio' },
    { key: 'Monto',       title: 'Monto' },
    { key: 'RN',           title: 'RN' },
    { key: 'tipoRsva',     title: 'Tipo Rsva' },
    { key: 'gpoTipoRsva',  title: 'Gpo Tipo Rsva' },
    { key: 'HotelOk',        title: 'Hotel' },
    { key: 'CorporativoOk',  title: 'Corporativo' },
    { key: 'DestinationOk',  title: 'Destination' },
  ]
  checkCol:Object = {}

  columnsCopy: Columns[] = [];

  apiData:Object
  defaultData:Object = {
    'chanGroup':{
      'marca':{
        'status':true,
        'showCol':true,
        'groupBy':false,
        'name':'marca',
        'searchType':'in',
        'params':['Marcas Propias']
      },
      'gpoCanalKpi':{
        'status':false,
        'showCol':true,
        'groupBy':true,
        'name':'gpoCanalKpi',
        'searchType':'in',
        'params':['Outlet']
      },
      'gpoCanal':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'gpoCanal',
        'searchType':'in',
        'params':[]
      },
      'canal':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'canal',
        'searchType':'in',
        'params':[]
      },
      'pais':{
        'status':true,
        'showCol':true,
        'groupBy':false,
        'name':'pais',
        'searchType':'in',
        'params':['MX']
      },'tipoCanal':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'tipoCanal',
        'searchType':'in',
        'params':[]
      }
    },
    'tipoRsva':{
      'tipoRsva':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'tipoRsva',
        'searchType':'in',
        'params':[]
      },
      'gpoTipoRsva':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'gpoTipoRsva',
        'searchType':'in',
        'params':[]
      }
    },
    'fecha':{
      'Fecha':{
        'status':true,
        'showCol':true,
        'groupBy':true,
        'name':'Fecha',
        'searchType':'between',
        'params':['2019-05-09','2019-05-13']
      },
      'Hora':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'Hora',
        'searchType':'between',
        'params':['00:00:00','23:59:00']
      }
    },
    'itemTypes':{
      'servicio':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'servicio',
        'searchType':'in',
        'params':[]
      }
    },
    'genGroup':{
      'Asesor':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'asesor',
        'searchType':'in',
        'params':[]
      }
    },
    'branchId':{
      'branchId':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'branchId',
        'searchType':'in',
        'params':[]
      }
    },
    'hotel':{
      'Hotel':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'Hotel',
        'searchType':'like',
        'params':[]
      },
      'Corporativo':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'Corporativo',
        'searchType':'like',
        'params':[]
      },
      'Destination':{
        'status':false,
        'showCol':true,
        'groupBy':false,
        'name':'Destination',
        'searchType':'like',
        'params':[]
      }
    }
  }

  genPar:Object = {
    isPaq: true,
    outlet: false,
    sv: true,
    loc: false,
    compare: false,
    hotel: false
  }
  opts:Object = {}
  asesores:Object = {}

  // Settings configuration
  selectorSettings: IMultiSelectSettings = {
      enableSearch: true,
      checkedStyle: 'checkboxes',
      buttonClasses: 'btn btn-secondary btn-block',
      containerClasses: 'zi-1000',
      dynamicTitleMaxItems: 1,
      displayAllSelectedText: true,
      showCheckAll: true,
      showUncheckAll: true,
      maxHeight:  '300px',
      closeOnClickOutside: true,
      stopScrollPropagation: false
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
  checked:any = []

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
    this.columnsCopy = this.columns

    let ch:any = []
    for( let g of this.columns ){
        ch.push(g.key);
        this.checkCol[g.key]=true
    }

    this.checked = new Set(ch)
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - ProReports');

    this.config =  EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 50
    this.config['paginationRangeEnabled'] = true

    for( let group in this.apiData ){
      if( this.apiData.hasOwnProperty(group) ){
        for( let field in this.apiData[group] ){
          if (this.apiData[group].hasOwnProperty(field)) {
            this.selectorChange(null, group, field, false)
          }
        }
      }
    }

    this.getAsesores()
    this.loadPresets()

  }

  toggle(name: string, value: boolean): void {
    value ? this.checked.add(name) : this.checked.delete(name);
    this.columns = this.columnsCopy.filter((column) => this.checked.has(column.key));
    this.checkCol[name] = value
    // console.log(this.columns)
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
              console.log('ERROR', err)

              this.loading['filter'][group] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
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
              console.log('ERROR', err)

              this.loading['asesores'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  getReport( sort = [] ){
    this.loading['report'] = true

    this.validateColumns()

    let par = JSON.parse(JSON.stringify(this.apiData))

    if( this.genPar['loc'] ){
      // tslint:disable-next-line:forin
      for( let g in par ){
        // tslint:disable-next-line:forin
        for( let f in par[g] ){
          par[g][f]['showCol'] = true
        }
      }
    }

    this._api.restfulPut( {data: par, gen: this.genPar},'Prorep/pr' )
            .subscribe( res => {

              this.loading['report'] = false
              this.dataRep = res['data']
              if( sort.length > 0 ){
                if(sort[0] == 'asc' ){
                  this.sortAsc(sort[1],sort[2])
                }else{
                  this.sortDesc(sort[1],sort[2])
                }
              }

            }, err => {
              console.log('ERROR', err)

              this.loading['report'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
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

    this.apiData['fecha']['Fecha']['params'][0] = start.format('YYYY-MM-DD')
    this.apiData['fecha']['Fecha']['params'][1] = end.format('YYYY-MM-DD')
    this.apiData['fecha']['Hora']['params'][0] = start.format('HH:mm:ss')
    this.apiData['fecha']['Hora']['params'][1] = end.format('HH:mm:ss')

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

    let js:any = []

    for(let r of this.dataRep){
      let t:Object = {}
      for(let c of this.columns){
        t[c.key]=r[c.key]
      }
      js.push(t)
    }

    wb.Sheets['reporte'] = utils.json_to_sheet(js, {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `reporte_personalizado.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
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
                console.log('ERROR', err)

                this.loading['savePreset'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  loadPresets(  ){
    this.loading['loadPreset'] = true

    this._api.restfulGet( '', 'Prorep/loadPreset' )
              .subscribe( res => {

                this.loading['loadPreset'] = false
                let presets = []
                let i = 0
                for(let item of res['data']){
                  presets.push( { id: i, name: item['name'], params: JSON.parse(item['val']) } )
                  i++
                }
                this.presets = presets
                console.log(this.presets)


              }, err => {
                console.log('ERROR', err)

                this.loading['loadPreset'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  selectPreset( index ){
    let i = 0
    for(let ps of this.presets){
      if(ps['id'] == index){
        this.selectedPreset = ps
        this.apiData = JSON.parse(JSON.stringify(ps['params']))
        return false
      }
      i++
    }
  }

  printDate(d,f, t = false){
    return d ? moment( t ? `${moment().format('YYYY-MM-DD')} ${d}` : d).format(f) : null
  }

  validateSel( f, fl ){
    switch(fl){
      case 'g_hotel':
      case 'g_corp':
      case 'g_dest':
        if( f ){
          this.genPar['hotel'] = true
          // this.toggle('Hotel', true)
          // this.toggle('Corporativo', true)
          // this.toggle('Destination', true)
        }else{
          this.apiData['hotel']['Hotel']['params'][0] = ''
          this.apiData['hotel']['Corporativo']['params'][0] = ''
          this.apiData['hotel']['Destination']['params'][0] = ''
        }
        break
      case 'hotel':
        if( f ){
          // this.toggle('Hotel', true)
          // this.toggle('Corporativo', true)
          // this.toggle('Destination', true)
        }else{
          // this.toggle('Hotel', false)
          // this.toggle('Corporativo', false)
          // this.toggle('Destination', false)
          this.apiData['hotel']['Hotel']['params'][0] = ''
          this.apiData['hotel']['Corporativo']['params'][0] = ''
          this.apiData['hotel']['Destination']['params'][0] = ''
        }
        break
    }
  }

  validateColumns(){
    // if( !this.apiData['branchId']['branchId']['groupBy'] ){
    //   this.toggle('Sucursal', false)
    // }else{
    //   this.toggle('Sucursal', true)
    // }

    // if( !this.apiData['genGroup']['Asesor']['groupBy'] ){
    //   this.toggle('NombreAsesor', false)
    // }else{
    //   this.toggle('NombreAsesor', true)
    // }

    // if( !this.genPar['loc'] ){
    //   this.toggle('Localizador', false)
    // }else{
    //   this.toggle('Localizador', true)
    // }

  }

  setPreset(n){
    // 'Localizador'
    // 'Fecha'
    // 'Hora'
    // 'pais'
    // 'marca'
    // 'gpoCanal'
    // 'tipoCanal'
    // 'gpoCanalKpiOk'
    // 'Sucursal'
    // 'NombreAsesor'
    // 'servicio'
    // 'Monto'
    // 'RN'
    // 'tipoRsva'
    // 'gpoTipoRsva'
    // 'HotelOk'
    // 'CorporativoOk'
    // 'DestinationOk'
    let mt = [], gp = []
    switch(n){
      case 0:
        // Fecha
        mt = ['Localizador','Fecha','Monto','RN']
        gp = ['Fecha']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['asc', 'Fecha', true] )
        break
      case 1:
        // Sucursal
        mt = ['Localizador','Fecha','Sucursal','Monto','RN']
        gp = ['Sucursal']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['asc', 'Sucursal', true] )
        break
      case 2:
        // Destinos
        mt = ['Localizador','Fecha','Monto','RN','DestinationOk']
        gp = ['Fecha','DestinationOk']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['desc', 'RN', false] )
        break
      case 3:
        // Corporativos
        mt = ['Localizador','Fecha','servicio','Monto','RN','CorporativoOk']
        gp = ['Fecha','servicio','CorporativoOk']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['desc', 'RN', false] )
        break
      case 5:
        // Asesores
        mt = ['Fecha','Localizador','Sucursal','Monto','RN','NombreAsesor']
        gp = ['NombreAsesor']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['desc', 'Monto', false] )
        break
      case 6:
        // Hora
        mt = ['Localizador','Hora','Monto','RN']
        gp = ['Hora']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['asc', 'Hora', true] )
        break
      case 7:
        // Fecha / Hora
        mt = ['Localizador','Fecha','Hora','Monto','RN']
        gp = ['Fecha','Hora']
        this.multiTog( mt )
        this.multiGroup( gp )
        // this.getReport( ['asc', 'Sucursal', true] )
        break
      case 4:
        // Hotel
        mt = ['Localizador','Fecha','servicio','Monto','RN','HotelOk']
        gp = ['Fecha','servicio','HotelOk']
        this.multiTog( mt )
        this.multiGroup( gp )
        this.getReport( ['desc', 'RN', false] )
        break
    }
  }

  multiTog( arr ){
    for( let c of this.columnsCopy ){
      if( arr.indexOf(c.key) > -1){
        this.toggle(c.key, true)
      }else{
        this.toggle(c.key, false)
      }
    }
  }

  multiGroup( arr ){

    let gps = [
      ['Fecha','fecha','Fecha'],
      ['Hora','fecha','Hora'],
      ['servicio','itemTypes','servicio'],
      ['Sucursal','branchId','branchId'],
      ['NombreAsesor','genGroup','Asesor'],
      ['HotelOk','hotel','Hotel'],
      ['CorporativoOk','hotel','Corporativo'],
      ['DestinationOk','hotel','Destination']
    ]

    for( let c of gps ){
      if( arr.indexOf(c[0]) > -1 ){
        this.apiData[c[1]][c[2]]['groupBy'] = true
      }else{
        this.apiData[c[1]][c[2]]['groupBy'] = false
      }
    }
  }

  sortAsc( f, text = false ): void {
    this.dataRep = [...this.dataRep.sort((a, b) => {
      const nA = text ? a[f].toLowerCase() : parseInt(a[f])
      const nB = text ? b[f].toLowerCase() : parseInt(b[f])

      if( text ){
        return nA.localeCompare(nB);
      }else{
        if (nB < nA) {
          return 1;
        }
        if (nB > nA) {
          return -1;
        }
        return 0;
      }
    })];
  }

  sortDesc( f, text = false ): void {
    this.dataRep = [...this.dataRep.sort((a, b) => {
      const nA = text ? a[f].toLowerCase() : parseFloat(a[f])
      const nB = text ? b[f].toLowerCase() : parseFloat(b[f])

      if( text ){
        return nB.localeCompare(nA);
      }else{
        if (nB < nA) {
          return -1;
        }
        if (nB > nA) {
          return 1;
        }
        return 0;
      }
    })];
  }

}

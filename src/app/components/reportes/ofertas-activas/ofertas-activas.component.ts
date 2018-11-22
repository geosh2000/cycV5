import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';

@Component({
  selector: 'app-ofertas-activas',
  templateUrl: './ofertas-activas.component.html',
  styles: []
})
export class OfertasActivasComponent implements OnInit {

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
  mainCredential:string = 'default'

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

  config:EasyTableServiceService
  columns:any = [
    { key: 'Segmento', title: 'Segmento' },
    { key: 'Destination', title: 'Destino' },
    { key: 'Tipo', title: 'Tipo' },
    { key: 'Incentivo', title: 'Incentivo' },
    { key: 'Name', title: 'Nombre' },
    { key: 'priceDiscount', title: 'Descuento' },
    { key: 'bookWinStart', title: 'Booking Inicio' },
    { key: 'bookWinEnd', title: 'Booking Fin' },
    { key: 'travWinStart', title: 'Travel Inicio' },
    { key: 'travWinEnd', title: 'Travel Fin' },
    { key: 'Activo', title: 'Status' },
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
    this.config['rows'] = 50
    this.config['paginationRangeEnabled'] = true

    this.getData();

    this.titleService.setTitle('CyC - Ofertas Activas');
  }

  setVal( val ){
    this.dateSelected = val.format('YYYY-MM-DD')
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( this.dateSelected, 'Lists/ofertas' )
            .subscribe( res => {

              this.loading['data'] = false
              let data = res['data']
              for(let item of data){
                // tslint:disable-next-line:forin
                for(let field in item){
                  item[field] = item[field] ? item[field].normalize('NFD').replace(/[\u0300-\u036f]/g, '') : null
                }
              }

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

  updateData( val, row, field ){
    this.loading['update'] = true

    let params = {
      id: row['id'],
      field: field,
      val: val
    }

    this._api.restfulPut( params, 'Lists/updateOfertas' )
            .subscribe( res => {

              this.loading['update'] = false
              this.toastr.success( 'Información Modificada', 'Guardado' )
              row[field] = val

              console.log(res)
            }, err => {
              console.log('ERROR', err)

              this.loading['update'] = false

              row[field] = val == 1 ? 0 : 1

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  changeIncentivo( field, row ){
    if( this._init.checkSingleCredential('pdv_ofertasUpload') ){
      let val = parseInt(row[field]) == 1 ? 0 : 1
      // let val = 3
      this.changeInc( field, row, val, true )
    }
  }

  changeInc( field, row, val, inc = false ){
    this.updateData( inc ? val : (val.checked ? 1 : 0), row, field )
  }

  printDate( date, format ){
    return moment(date).format(format)
  }

}

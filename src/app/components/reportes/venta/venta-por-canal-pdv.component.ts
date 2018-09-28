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
  selector: 'app-venta-por-canal-pdv',
  templateUrl: './venta-por-canal-pdv.component.html',
  styles: []
})
export class VentaPorCanalPdvComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  currentUser:any

  searchStart:any
  searchEnd:any
  soloVenta:boolean = false
  isPaq:boolean = true
  isAsesor:boolean = false
  isTotal:boolean = false
  prodLu:string

  loading:Object = {}
  ventaData:any
  locsData:any

  options: Object

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
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Reportes PDV');
  }

  dateChange( start, end ){

    this.searchStart = start.format('YYYY-MM-DD')
    this.searchEnd = end.format('YYYY-MM-DD')

    jQuery('#datepicker').val(`${start.format('DD MMM \'YY')} - ${end.format('DD MMM \'YY')}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  search(){

    this.loading['data'] = true

    let sv = this.soloVenta ? 1 : 0
    let as = this.isAsesor ? 1 : 0
    let tot = this.isTotal ? 1 : 0

    let inicio = this.searchStart
    let fin = this.searchEnd

    this._api.restfulGet( `${inicio}/${fin}/${sv}/${this.isPaq}/${as}/${tot}`, 'venta/getVentaPorPDV')
            .subscribe( res =>{
              this.ventaData = res['data']

              this.loading['data'] = false
            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)
                this.loading['data'] = false
              }
            })
  }

  printDate( date, format, tz='mx' ){
    let fecha

    if(tz!='mx'){
      let fechaTmp = moment.tz(date, 'America/Mexico_City')
      fecha = fechaTmp.clone().tz('America/Bogota')
    }else{
      fecha = moment(date)
    }

    moment.updateLocale('en', {
      weekdays : [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ]
    })

    return fecha.format( format )
  }

  printFormated( data ){
    return data.toFixed(2)
  }

  downloadXLS( id, title ){
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

  dwlTitle(){

    let sv
    let type

    if(this.soloVenta){
      sv = 'soloVenta'
    }else{
      sv = 'ventaYcxl'
    }


    let title = `ventaPorPDV (${sv}) - ${this.searchStart}a${this.searchEnd}`

    return title
  }

  coalesce(orig, repl){
    return orig == null ? repl : orig
  }
}

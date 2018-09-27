import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common'

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService, InitService } from '../../../services/service.index';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-venta-por-canal',
  templateUrl: './venta-por-canal.component.html',
  styles: [],
  providers: [CurrencyPipe]
})
export class VentaPorCanalComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  currentUser:any

  searchStart:any
  searchEnd:any
  soloVenta:boolean = true
  pdvType:boolean = false
  tdInfo:boolean = false
  prod:boolean = false
  isPaq:boolean = false
  isAmmount:boolean = true
  isHour:boolean = false
  prodLu:string

  loadingData:boolean = false
  ventaData:any
  locsData:any

  options: Object

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
                public _api:ApiService,
                private _init:InitService,
                public toastr: ToastrService,
                public route:Router,
                public activatedRoute:ActivatedRoute,
                private titleService:Title,
                private cp:CurrencyPipe
                ){ 
                  this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Venta por Canal MP');
  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${start.format("DD MMM 'YY")} - ${end.format("DD MMM 'YY")}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  search( flag? ){

    this.ventaData = null
    this.loadingData = true

    let sv    = 1
    let type  = 1
    let td = 1
    let prod = 1

    let inicio = moment().format('YYYY-MM-DD')
    let fin = moment().format('YYYY-MM-DD')

    if(!this.soloVenta){
      sv = 0
    }
    if(!this.pdvType){
      type = 0
    }
    if(!this.tdInfo){
      td      = 0
      inicio  = this.searchStart
      fin     = this.searchEnd
    }
    if(!this.prod){
      prod      = 0
    }

    if( flag ){
      prod = flag.flag ? 1 : 0
    }

    let hour = this.isHour ? 1 : 0
    let ammount = this.isAmmount ? 1 : 0


    this._api.restfulGet( `${inicio}/${fin}/${sv}/${type}/${td}/${prod}/${this.isPaq}/${ ammount }/${ hour }`, 'venta/getVentaPorCanalSV')
            .subscribe( res =>{
              this.ventaData = res['data']['venta']
              this.locsData = res['data']['locs']

              console.log

              if(this.tdInfo){
                this.prodLu = res['lu']
              }else{
                this.prodLu = null
              }

              this.loadingData = false
            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loadingData = false
              }
            })
  }

  printDate( date, format, tz='mx' ){
    let fecha

    if(tz!='mx'){
      let fechaTmp = moment.tz(date, 'America/Mexico_City')
      fecha = fechaTmp.clone().tz("America/Bogota")
    }else{
      fecha = moment(date)
    }

    moment.updateLocale('en', {
      weekdays : [ "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ]
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
    // console.log(wb)

    if(this.prod){
      for(let index in wb.Sheets['Sheet1']){
        if( index.match( /^[D-L]([1-9][0-9]+|[2-9])$/ )){
          if( index.match( /^[D-H,K-L][0-9]+$/ ) ){
            wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(1,100).replace(/[,]/g,'')
          }else{
            wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.replace('%','')
            wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v/100
          }
          wb.Sheets['Sheet1'][index].t = 'n'
        }
      }
    }else{
      for(let index in wb.Sheets['Sheet1']){
        if( index.match( /^[C-K]([1-9][0-9]+|[2-9])$/ )){
          if( index.match( /^[C-G,J-K][0-9]+$/ ) ){
            wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(1,100).replace(/[,]/g,'')
          }else{
            wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.replace('%','')
            wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v/100
          }
          wb.Sheets['Sheet1'][index].t = 'n'
        }
      }
    }



    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    // console.log(wb)

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
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

    if(this.pdvType){
      type = 'porCanalPDV'
    }else{
      type = 'porTipoPDV'
    }

    let title = `ventaPorCanal (${sv} - ${type}) - ${this.searchStart}a${this.searchEnd}`

    return title
  }

  coalesce( item, value, currency = false, hour?, producto? ){

    let val, loc

    if( producto ){
      if( this.isHour ){
        if( this.ventaData[item] && this.ventaData[item][hour] && this.ventaData[item][hour][producto] ){
          val = this.ventaData[item][hour][producto][value] ? this.ventaData[item][hour][producto][value] : 0
        }else{
          val = 0
        }
        if( this.locsData[item] && this.locsData[item][hour] && this.locsData[item][hour][producto] ){
          loc = this.locsData[item][hour][producto][value] ? this.locsData[item][hour][producto][value] : 0
        }else{
          loc = 0
        }
      }else{
        if( this.ventaData[item] && this.ventaData[item][producto] ){
          val = this.ventaData[item][producto][value] ? this.ventaData[item][producto][value] : 0
        }else{
          val = 0
        }
        if( this.locsData[item] && this.locsData[item][producto] ){
          loc = this.locsData[item][producto][value] ? this.locsData[item][producto][value] : 0
        }else{
          loc = 0
        }
      }

    }else{
      if( this.isHour ){
        if( this.ventaData[item] && this.ventaData[item][hour] ){
          val = this.ventaData[item][hour][value] ? this.ventaData[item][hour][value] : 0
        }else{
          val = 0
        }
        if( this.locsData[item] && this.locsData[item][hour] ){
          loc = this.locsData[item][hour][value] ? this.locsData[item][hour][value] : 0
        }else{
          loc = 0
        }
      }else{
        if( this.ventaData[item] ){
          val = this.ventaData[item][value] ? this.ventaData[item][value] : 0
        }else{
          val = 0
        }
        if( this.locsData[item] ){
          loc = this.locsData[item][value] ? this.locsData[item][value] : 0
        }else{
          loc = 0
        }
      }
    }

    return this.isAmmount ? ( currency ? this.cp.transform(val, 'MXN', 'symbol-narrow' , '.2-2') : val ) : loc

  }

  sumVals( item, arr, currency = false, hour?, producto? ){
    let result = 0
    for( let v of arr ){
      result += this.coalesce( item, v, false, hour, producto )
    }

    if( currency ){
      return this.cp.transform(result, 'MXN', 'symbol-narrow' , '.2-2')
    }else{
      return result
    }
  }

  chgHour( event ){
    this.isHour = event

    if( event ){
      jQuery('datepicker').val(moment(this.searchStart).format('YYYY-MM-DD'))
    }else{
      jQuery('datepicker').val(`${moment(this.searchStart).format('YYYY-MM-DD')} - ${moment(this.searchEnd).format('YYYY-MM-DD')}`)
    }

    this.search()
  }

}

import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import * as moment from 'moment';
declare var jQuery:any;


import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-cuartiles',
  templateUrl: './cuartiles.component.html',
  styles: []
})
export class CuartilesComponent implements OnInit {

  ready:boolean = false
  loadingCuartiles:boolean = false
  errorFlag:boolean = false

  searchStart:any
  searchEnd:any
  skill:any = ''

  currentUser:any
  listCuartiles:any
  errorMsg:any

  smartTableSettings = {
    columns: {
      Nombre:               { title: 'Nombre'},
      user:                 { title: 'Usuario'},
      Supervisor:           { title: 'Supervisor'},
      LocsPeriodo:          { title: 'Locs Periodo'},
      FC:                   { title: 'FC',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent} %`
                                }

                                return result
                              }
                            },
      TotalSesion:          { title: 'Total Sesion',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})+" seg."
                                }
                                return result
                              }
                            },
      Total_Llamadas_Real:  { title: 'Total Llamadas Real'},
      Utilizacion:          { title: 'Utilizacion',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent} %`
                                }

                                return result
                              }
                            },
      PNP:                  { title: 'PNP',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})+" seg."
                                }
                                return result
                              }
                            },
      Sesion:               { title: 'Sesion',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})+" seg."
                                }
                                return result
                              }
                            },
      MontoPeriodo:         { title: 'Monto Periodo',
                              valuePrepareFunction: function(cell,row){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = "$" + parseFloat(cell).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                                }
                                return result
                              }
                            },
      MontoNoPeriodo:       { title: 'Monto No Periodo',
                              valuePrepareFunction: function(cell,row){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = "$" + parseFloat(cell).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                                }
                                return result
                              }
                            },
      MontoTotal:           { title: 'Monto Total',
                              valuePrepareFunction: function(cell,row){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = "$" + parseFloat(cell).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                                }
                                return result
                              }
                            },
      ShortCalls_Absoluto:  { title: 'ShortCalls Absoluto'},
      ShortCalls_Relativo:  { title: 'ShortCalls Relativo',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent} %`
                                }

                                return result
                              }
                            },
      AHT:                  { title: 'AHT',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toFixed(2) + " seg."
                                }
                                return result
                              }
                            },
      ACW_Absoluto:         { title: 'ACW Absoluto',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})+" seg."
                                }
                                return result
                              }
                            },
      ACW_Relativo:         { title: 'ACW Relativo',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent} %`
                                }

                                return result
                              }
                            },
    },
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    pager: {
      perPage: 100
    }
  }

  public multiPicker = {
    showDropdowns: true,
    opens: "left"
  }



  constructor(
              private _api:ApiService
              ) {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  ngOnInit() {
  }

  getCuartiles( inicio, fin, skill ){

    // console.log(inicio,fin,skill)

    this.loadingCuartiles = true
    this.ready = false
    this.errorFlag = false

    this._api.restfulGet( '', `Cuartiles/getCuartiles/${inicio}/${fin}/${skill}`)
            .subscribe( res => {

              this.loadingCuartiles = false
              this.ready = true

              if(res['status']){
                console.log( res )
                this.listCuartiles = res['data']

              }else{
                this.errorFlag = true
                this.errorMsg = res['error']
                console.error( res )
              }
            })
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});
    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  setPcrc( val ){
    this.skill = val
  }


}

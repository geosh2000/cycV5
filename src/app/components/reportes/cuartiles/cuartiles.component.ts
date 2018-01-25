import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook, read } from 'xlsx';

import * as moment from 'moment';
declare var jQuery:any;


import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

@Component({
  selector: 'app-cuartiles',
  templateUrl: './cuartiles.component.html',
  styles: []
})
export class CuartilesComponent implements OnInit {

  mainCredential:string     = 'asesor_cuartiles'
  showContents:boolean = false
  ready:boolean = false
  loadingCuartiles:boolean = false
  errorFlag:boolean = false

  searchStart:any
  searchEnd:any
  skill:any = ''
  dataLoading:boolean = false

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
      FCQ:                  { title: 'Cuartil FC'},
      TotalSesion:          { title: 'Total Sesion',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})
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
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})
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
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})
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
      MontoTotalQ:          { title: 'Cuartil Monto Total'},
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
      Colgadas_Absoluto:  { title: 'Colgadas Absoluto'},
      Colgadas_Relativo:  { title: 'Colgadas Relativo',
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
      Colgadas_RelativoQ:   { title: 'Cuartil Colgadas'},
      AHT:                  { title: 'AHT',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toFixed(2)
                                }
                                return result
                              }
                            },
      AHTQ:                  { title: 'Cuartil AHT'},
      ACW_Absoluto:         { title: 'ACW Absoluto',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = parseFloat(cell).toLocaleString('es-MX', {minimumFractionDigits: 0})
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
      perPage: 100000
    }
  }

  public multiPicker = {
    showDropdowns: true,
    opens: "left"
  }



  constructor(
              private _api:ApiService,
              private _init:InitService,
              public toastr: ToastsManager, vcr: ViewContainerRef,
              ) {
    this.toastr.setRootViewContainerRef(vcr);
    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

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

              this.listCuartiles = res['data']

            }, err => {
              console.log("ERROR", err)

              this.loadingCuartiles = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)
              return false

            })

  }

  downloadXLS( id, title, json = false ){
    if( json ){
      this.getDataFecha( this.searchStart, this.searchEnd, this.skill )
    }else{
      this.toXls( id, title, json )
    }
  }

  getDataFecha( inicio, fin, skill ){
    this.dataLoading = true

    this._api.restfulGet( '', `Cuartiles/getCuartilesFecha/${inicio}/${fin}/${skill}`)
              .subscribe( res => {

                this.dataLoading = false
                let data:any = [], i = 0

                for( let item of res.data ){
                  if( i != 0){
                    let itData: Object = {}
                    for( let field in item ){
                      if( field == 'Nombre' || field == 'Fecha' || field == 'user' || field == 'Supervisor' ){
                        itData[field] = item[field]
                      }else{
                        if( item[field] == null || item[field] == '' ){
                          itData[field] = parseFloat(0)
                        }else{
                          itData[field] = parseFloat(item[field])
                        }
                      }
                    }
                    data.push(itData)
                  }
                  i++
                }
                this.toXls( data, 'CuartilesPorFecha', true )

              }, err => {
                console.log("ERROR", err)

                this.dataLoading = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                return false

              })
  }

  toXls( sheets, title, json ){
    let wb:any

    if( json ){
      wb = { SheetNames: [], Sheets: {} };
      wb.SheetNames.push(title);
      wb.Sheets[title] = utils.json_to_sheet(sheets, {cellDates: true});
    }else{
      wb = utils.table_to_book(document.getElementById(sheets), {raw: false});
    }

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

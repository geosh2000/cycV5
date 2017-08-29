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
import { InitService } from '../../../services/init.service';

@Component({
  selector: 'app-por-intervalo',
  templateUrl: './por-intervalo.component.html',
  styles: []
})
export class PorIntervaloComponent implements OnInit {

  mainCredential:string     = 'forecast_report'
  showContents:boolean = false
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
              private _api:ApiService,
              private _init:InitService,
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

  }

  ngOnInit() {
  }

}

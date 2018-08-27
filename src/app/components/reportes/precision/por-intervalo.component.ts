import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import * as moment from 'moment';
declare var jQuery:any;


import { ApiService, InitService } from '../../../services/service.index';

@Component({
  selector: 'app-por-intervalo',
  templateUrl: './por-intervalo.component.html',
  styles: []
})
export class PorIntervaloComponent implements OnInit {

  mainCredential:string     = 'forecast_report'
  showContents:boolean = false
  ready:boolean = false
  loadingIntervalo:boolean = false
  errorFlag:boolean = false

  searchStart:any
  searchEnd:any
  skill:any = ''

  currentUser:any
  listIntervalo:any
  errorMsg:any

  smartTableSettings = {
    columns: {
      Fecha:               { title: 'Fecha'},
      HoraGroup:           { title: 'Hora',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let hora = (parseInt(cell)/2).toFixed(2)
                                  result = hora
                                }

                                return result
                              }
                            },
      Skill:                { title: 'PCRC',
                              valuePrepareFunction: function(cell){
                                let pcrcs = { 3: 'Ventas MT', 4: 'SAC IN', 7:'Agencias', 8:'TMT', 9:'TMP', 35:'Ventas MP'}
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  result = pcrcs[parseInt(cell)]
                                }
                                return result
                              }
                            },
      forecast:             { title: 'Pronóstico'},
      calls:                { title: 'Real'},
      prec:                 { title: 'Precisión',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent}%`
                                }

                                return result
                              }
                            },
      SLA:                 { title: 'SLA',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent}%`
                                }

                                return result
                              }
                            },
      Programados:          { title: 'Asesores Programados'},
      erlang:               { title: 'Asesores Erlang'},
      requeridos:           { title: 'Asesores Requeridos'},
      CalidadProg:          { title: 'Calidad Programacion',
                              valuePrepareFunction: function(cell){
                                let result
                                if(cell == null){
                                  result = null
                                }else{
                                  let percent = (parseFloat(cell)*100).toFixed(2)
                                  result = `${percent}%`
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
      perPage: 10000
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

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  setPcrc( val ){
    this.skill = val
  }

  getIntervalo( inicio, fin, skill ){

    // console.log(inicio,fin,skill)

    this.loadingIntervalo = true
    this.ready = false
    this.errorFlag = false

    this._api.restfulGet( '', `Precision/detalle_intervalo/${inicio}/${fin}/${skill}`)
            .subscribe( res => {

              console.log("PURE RES", res)

              this.loadingIntervalo = false
              this.ready = true

              if(res['status']){
                console.log( res )
                this.listIntervalo = res['data']

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

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

}

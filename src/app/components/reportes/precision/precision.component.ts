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
  selector: 'app-precision',
  templateUrl: './precision.component.html',
  styles: []
})
export class PrecisionComponent implements OnInit {

  mainCredential:string     = 'forecast_report'
  showContents:boolean = false
  ready:boolean = false
  loadingPrecision:boolean = false
  errorFlag:boolean = false

  searchStart:any
  searchEnd:any

  currentUser:any
  listPrecision:any
  errorMsg:any

  smartTableSettings = {
    columns: {
      Departamento:         { title: 'Departamento'},
      prec:                 { title: 'Precisión',
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
                            }
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

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    // this.getPrecision(this.searchStart, this.searchEnd, this.skill)
  }

  ngOnInit() {
  }

  getPrecision( inicio, fin, skill ){

    // console.log(inicio,fin,skill)

    this.loadingPrecision = true
    this.ready = false
    this.errorFlag = false

    this._api.restfulGet( '', `Precision/getPrecision/${inicio}/${fin}/${skill}`)
            .subscribe( res => {

              this.loadingPrecision = false
              this.ready = true

              if(res['status']){
                console.log( res )
                this.listPrecision = res['data']

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

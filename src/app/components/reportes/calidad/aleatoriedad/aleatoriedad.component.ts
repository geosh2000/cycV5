import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ApiService } from '../../../../services/api.service';
import { InitService } from '../../../../services/init.service';
import { TokenCheckService } from '../../../../services/token-check.service';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-aleatoriedad',
  templateUrl: './aleatoriedad.component.html',
  styles: []
})
export class AleatoriedadComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'reportes_aleatoriedad'

  loading:Object = {}

  dataCriteria:any
  dataAleatoriedad:any

  form:Object = {
    dates     : {},
    type      : true,
    criteria  : '',
    q         : 1
  }

  datePickerVal:any = ''

  public multiPicker = {
    showDropdowns: true,
    opens: "left"
  }

  q:any = [1,2,3,4,5,6,7,8,9,10]

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    this.datePickerVal = `${moment().subtract(1,'days').format('YYYY-MM-DD')} - ${moment().format('YYYY-MM-DD')}`
    this.form['dates']['inicio']  = moment().subtract(1,'days').format("YYYY-MM-DD")
    this.form['dates']['fin']     = moment().format("YYYY-MM-DD")

    this.getDeps()
  }

  ngOnInit() {
  }

  dateChange( start, end ){

    this.form['dates']['inicio']  = start.format("YYYY-MM-DD")
    this.form['dates']['fin']     = end.format("YYYY-MM-DD")

    this.datePickerVal = `${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`

  }

  getDeps(){
    this.loading['criteria'] = true

    this._api.restfulGet( '', 'Headcount/departamentos' )
              .subscribe( res => {

                this.loading['criteria'] = false

                this.dataCriteria = []

                for(let item of res['data']){
                  let arr = { id: item['id'], name: item['Departamento'] }
                  this.dataCriteria.push( arr )
                }


              }, err => {
                console.log("ERROR", err)

                this.loading['criteria'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })

  }

  getSups(){
    this.loading['criteria'] = true

    this.form['criteria'] = ''

    this._api.restfulGet( '', 'Headcount/listSupers' )
              .subscribe( res => {

                this.loading['criteria'] = false

                this.dataCriteria = []

                for(let item of res['data']){
                  let arr = { id: item['asesor'], name: item['nombre'] }
                  this.dataCriteria.push( arr )
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['criteria'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })

  }

  typeChg( event ){

    if( event ){
      this.getDeps()
    }else{
      this.getSups()
    }

  }

  getData(){
    this.loading['search'] = true

    this._api.restfulPut( this.form, 'Aleatoriedad/getData' )
              .subscribe( res => {

                this.loading['search'] = false

                this.dataAleatoriedad = res['data']

              }, err => {
                console.log("ERROR", err)

                this.loading['search'] = false

                if(err.status != 500){
                  let error = err.json()
                  this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                  console.error(err.statusText, error.msg)
                }else{
                  this.toastr.error( err._body, `Error ${err.status} - ${err.statusText}` )
                }


              })
  }

  downloadXLS( title ){
    this.toXls( title )

  }

  toXls( title ){

    let wb = utils.book_new();
    let ws = utils.json_to_sheet(this.dataAleatoriedad['calls']);

    wb.SheetNames.push('Llamadas');
    wb.Sheets['Llamadas'] = ws;

    if( this.dataAleatoriedad['cases'].length > 0 ){
      ws = utils.json_to_sheet(this.dataAleatoriedad['cases']);
      wb.SheetNames.push('Casos');
      wb.Sheets['Casos'] = ws;
    }

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

}

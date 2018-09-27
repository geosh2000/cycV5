import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
declare var jQuery:any;

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

@Component({
  selector: 'app-hx-config',
  templateUrl: './hx-config.component.html',
  styles: []
})

export class HxConfigComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'default'
  currentUser:any

  searchStart:any
  searchEnd:any

  listDeps:any
  depLoading:boolean = false
  depLoadErr:boolean = false

  listDates:any
  dateLoading:boolean = false
  dateLoadErr:boolean = false

  testBool:boolean=false

  selectorStatus = {}

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
                public _api:ApiService,
                private _init:InitService,
                public toastr: ToastrService,
                public route:Router,
                public activatedRoute:ActivatedRoute
                ){


  }

  ngOnInit() {
  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${start.format("DD MMM 'YY")} - ${end.format("DD MMM 'YY")}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  getDeps(){
    this.depLoading = true

    this._api.restfulGet( '','headcount/Fdepartamentos' )
            .subscribe( res => {

              this.listDeps   = res['data']
              this.depLoading = false

            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                this.depLoadErr = true
                this.depLoading = false
                console.error(err.statusText, error.error)
              }
            })
  }

  getDates(){
    this.dateLoading = true

    this._api.restfulGet( `${this.searchStart}/${this.searchEnd}`,'horarios/hxconf' )
            .subscribe( res => {

              this.listDates    = res['data']
              this.dateLoading  = false

              this.getDeps()
              this.buildSelectors()

            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                this.dateLoadErr = true
                this.dateLoading = false
                console.error(err.statusText, error.msg)
              }
            })
  }

  buildSelectors(){
    for( let fecha in this.listDates ){
      for( let item in this.listDeps ){
        this.selectorStatus[this.listDates[fecha]] = {}
        this.selectorStatus[this.listDates[fecha]][this.listDeps[item].pcrc] = {}
        this.selectorStatus[this.listDates[fecha]][this.listDeps[item].pcrc]['monto']  = true
        this.selectorStatus[this.listDates[fecha]][this.listDeps[item].pcrc]['dias']   = false
      }
    }
  }

  search(){
    this.getDates()
  }

  formatFecha( fecha, format ){
    let date = moment(fecha)
    return date.format(format)
  }

  swChg(type, fecha, skill, event){
    // this.listDates[fecha][skill][type] = event
    let other = ""

    if(!event){
      switch(type){
        case 'monto':
          other = 'tiempo'
          break
        case 'tiempo':
          other = 'monto'
          break
      }

      if(!this.listDates[fecha][skill][other]){
        this.toastr.error('Al menos una de las dos opciones debe estar activa', 'Error!')
        this.resetVal(fecha, skill, other, true)
        return
      }
    }

    let params = {
      'Fecha':  fecha,
      'skill':  skill,
      'field':  type,
      'val':    event
    }

    this._api.restfulPut( params, 'horarios/hxchgtype' )
            .subscribe( res => {
              return
            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                this.getDates()
                console.error(err.statusText, error.error)
              }
            })

  }

  resetVal(fecha, skill, type, event){
    this.listDates[fecha][skill][type] = event
  }

}

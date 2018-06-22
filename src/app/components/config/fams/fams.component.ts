import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-fams',
  templateUrl: './fams.component.html',
  styles: [`
    input{ font-size: smaller !important; }
    .dropdownT-item.active, .dropdownT-item:active{ background-color: none !important;} }
    a{ color: #0c5460 !important; }
  `]
})
export class FamsComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'fams_edit'

  loading:Object    = {}
  new:Object        = {}
  deps:any

  depsSelected:any
  depOpts:any

  actualFams:any
  colFams:any

  order:string    = 'id'
  reverse:boolean = false
  newDisplay:boolean = false

  inputTypes:Object = {
    id:                 'save',
    evento:             'text',
    titulo:             'text',
    departamentos:      'multi',
    event_date:         'date',
    date_limit_inscript:'dateTime',
    date_start_display: 'date',
    date_limit_xld:     'dateTime',
    date_limit_display: 'dateTime',
    showEventDate:      'switch',
    activo:             'switch',
    msg:                'text'
  }

  // Settings configuration
  selectorSettings: IMultiSelectSettings = {
      enableSearch: true,
      buttonClasses: 'btn btn-light btn-block',
      dynamicTitleMaxItems: 1,
      displayAllSelectedText: true,
      showCheckAll: true,
      showUncheckAll: true
  };

  constructor(private _dateRangeOptions: DaterangepickerConfig,
              private _api:ApiService,
              private _init:InitService,
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

    this.getActive()
    this.getDeps()

  }

  ngOnInit() {

  }

  getActive(){
    this.loading['active'] = true

    this.actualFams = null

    this._api.restfulGet( '', 'Fams/displayActive' )
              .subscribe( res => {
                this.actualFams = {}

                this.loading['active'] = false

                this.actualFams['Activos']    = res['data']['actual']
                this.actualFams['Inactivos']  = res['data']['past']
                this.colFams                  = res['data']['cols']
              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['active'] = false
              })
  }

  sortBy( field ){
    if( this.order == field ){
      this.reverse = !this.reverse
    }else{
      this.reverse = false
    }

    this.order = field
  }

  newEvent(){
    this.newDisplay = true
  }

  cancelNew(){
    this.new = {}
    this.newDisplay = false
  }

  editEvent( item ){
    for( let field in item ){
      switch(this.inputTypes[field]){
        case 'multi':
          let multi = item[field].split('|')
          let multiRes = []
          for( let its of multi ){
            if(its != ''){
              multiRes.push( parseInt( its ) )
            }
          }
          this.new[field] = multiRes
          break
        case 'date':
        case 'dateTime':
          let date = moment(item[field])
          this.new[field] = {
            year:   parseInt( date.format('YYYY') ),
            month:  parseInt( date.format('MM') ),
            day:    parseInt( date.format('DD') )
          }

          if( this.inputTypes[field] == 'dateTime'){
            this.new[`${field}_time`] = {
              hour:     date.format('kk'),
              minute:   date.format('mm'),
              second:   date.format('ss')
            }
          }
          break
        case 'switch':
          let boolRes
          if( item[field] == 1 ){
            boolRes = true
          }else{
            boolRes = false
          }
          this.new[field] = boolRes
          break
        default:
          this.new[field] = item[field]
          break
      }
    }

    this.newDisplay = true
  }

  saveEdit(){
    this.xformData()

    if( this.validateEvent() ){

      this.loading['new'] = true

      let params = {
        id:     this.new['id'],
        update: this.new
      }

      this._api.restfulPut( params, 'Fams/editFam' )
              .subscribe( res => {

                this.loading['new'] = false
                this.cancelNew()
                this.getActive()

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['new'] = false
              })
    }else{
      this.toastr.error( 'Debes completar todos los campos', `Error!` )
    }
  }

  saveNew(){
    this.xformData()

    if( this.validateEvent() ){

      this.loading['new'] = true

      this._api.restfulPut( this.new, 'Fams/newFam' )
              .subscribe( res => {

                this.loading['new'] = false
                this.cancelNew()
                this.getActive()

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['new'] = false
              })
    }else{
      this.toastr.error( 'Debes completar todos los campos', `Error!` )
    }
  }

  xformData(){
    for( let field in this.new ){
      switch(this.inputTypes[field]){
        case 'multi':
          let tmpRes = []
          if(this.new[field].length > 0){
            for( let its of this.new[field] ){
              if( its != '' ){
                tmpRes.push( its )
              }
            }
          }
          let multiRes = tmpRes.join("|")
          this.new[field] = `|${multiRes}|`
          break
        case 'date':
        case 'dateTime':

          let date = `${this.new[field].year}-${this.new[field].month}-${this.new[field].day}`

          if( this.inputTypes[field] == 'dateTime'){
            if( this.new[`${field}_time`].hour == '24' ){
              this.new[`${field}_time`].hour = '00'
            }
            date = `${date} ${this.new[`${field}_time`].hour}:${this.new[`${field}_time`].minute}:${this.new[`${field}_time`].second}`
            delete this.new[`${field}_time`]
          }

          this.new[field] = date
          break
        case 'switch':
          if( this.new[field] ){
            this.new[field] = 1
          }else{
            this.new[field] = 0
          }
          break
      }
    }
  }

  validateEvent(){

    for( let field in this.inputTypes ){
      if( field != 'id' ){
        if( !this.new.hasOwnProperty(field) ){
          this.toastr.error(`La información está incompleta. Falta el campo ${field}. Por favor revisa nuevamente`, "Error!")
          return false
        }else{
          if( this.new[field] == '' && this.new[field]!=false){
            this.toastr.error(`La información está incompleta. Falta el campo ${field}. Por favor revisa nuevamente`, "Error!")
            return false
          }
        }


      }
    }

    return true

  }

  getDeps(){
    this.loading['deps']

    this._api.restfulGet( '', 'Headcount/getIdDepHc' )
              .subscribe( res => {

                this.loading['deps'] = false
                this.deps = []

                for( let item of res['data'] ){
                  let arr = { id: parseInt(item.id), name: item.name }
                  this.deps.push(arr)
                }


              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['deps'] = false
              })
  }

  selectorChange( event ){
    console.log(event)
  }

}

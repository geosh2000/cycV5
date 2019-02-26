import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators } from '@angular/forms';


import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { SurvHistoricComponent } from './surv-historic/surv-historic.component';
import { _MAT_INK_BAR_POSITIONER_FACTORY } from '../../../../../node_modules/@angular/material/tabs/typings/ink-bar';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styles: []
})
export class SurveyComponent implements OnInit {

  @ViewChild(SurvHistoricComponent) private _hist:SurvHistoricComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  loading:Object = {}

  filterValue=''

  surveyId:any
  surveyData:Object = {
    'master': null,
    'fields': [],
    'opts': [],
  }

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: 'left'
  }

  optsFilter:Object = {}

  form:FormGroup;
  formReady:boolean = false
  validateFlag:boolean = false

  constructor(public _api: ApiService,
    public _init:InitService,
    private titleService: Title,
    private _tokenCheck:TokenCheckService,
    private route:Router,
    private activatedRoute:ActivatedRoute,
    public toastr: ToastrService) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {
          if( res['status'] ){
          this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
          this.showContents = false
          jQuery('#loginModal').modal('show');
          }
        })

    this.activatedRoute.params.subscribe( params => {
      if( params ){
        this.surveyId = params.surveyId
        this.getSurveyData()
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Formularios');
  }

  buildForm(data){
    this.form = new FormGroup({})

    for( let field of data['fields'] ){
      let valids = []

      if( field['showStart'] == '1' && field['required'] == '1' ){
        valids.push( Validators.required )
      }

      if( field['regex'] ){
        valids.push( Validators.pattern( field['regex'] ) )
      }

      let dflt = null

      if( field['defaultVal'] ){
        if('currentUser'){
          dflt = this.currentUser['hcInfo']['id']
        }
      }

      this.form.addControl(
        field['id'],
        new FormControl( dflt, valids ))

      }

    this.formReady = true
    setTimeout( () => {
      for( let field of data['fields'] ){
        if( field['type'] == 'date' || field['type'] == 'datetime' ){
          this.form.controls[field['id']].reset()
        }
      }
    }, 500)
  }

  getSurveyData(){
    this.validateFlag = false
    this.loading['survey'] = true
    this.formReady = false

    this.surveyData = {
      'master': null,
      'fields': [],
      'opts': [],
    }

    this._api.restfulGet( this.surveyId, `Survey/survey`)
          .subscribe( res => {

            this.loading['survey'] = false

            this.buildForm( res['data'] )
            this.surveyData = res['data']

            this.titleService.setTitle('CyC - ' + this.surveyData['master']['name']);
            this.showContents = this._init.checkCredential( this.surveyData['master']['key'] ? this.surveyData['master']['key'] : 'default', true )

            for( let item of this.surveyData['fields'] ){
              if( !item['opts'] ){
                item['opts'] = []
              }

              if( item['trigger'] ){
                item['trigger'] = JSON.parse(item['trigger'].replace(/\'/gm, '"'))
              }

              if( item['titulo'] ){

                item['titulo'] = JSON.parse(item['titulo'].replace(/\'/gm, '"'))
              }

              for( let opt of this.surveyData['opts'] ){
                if( opt['fieldId'] == item['id'] ){
                  item['opts'].push(opt)
                }

                this.optsFilter[opt['id']] = opt
              }
            }

            for( let item of this.surveyData['fields'] ){
              if( item['trigger'] && item['type'] == 'select' ){
                for( let trig of item['trigger'] ){
                  this.optsFilter[trig]['isTrigger'] = true
                }
              }
            }

            console.log(this.surveyData)
            console.log(this.optsFilter)

          }, err => {

            console.log('ERROR', err)

            this.loading['survey'] = false

            let error = err.error
            this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
            console.error(err.statusText, error.msg)

          })
  }

  saveForm(){
    this.validateFlag = true

    if( this.form.valid ){
      this.buildPost()
    }
  }

  parse( val ){
    return parseInt( val )
  }

  resetChilds( parent, event ){

    for( let field of this.surveyData['fields'] ){
      if( field['parent'] == parent ){
        this.form.controls[field['id']].reset()

        let valids = []

        if( field['trigger'].indexOf(parseInt(event)) >= 0 ){
          if( field['regex'] ){
            valids.push( Validators.pattern( field['regex'] ) )
          }

          if( field['required'] == '1' ){
            valids.push( Validators.required )
          }
        }

        this.form.controls[field['id']].clearValidators()
        this.form.controls[field['id']].setValidators( valids )
        this.form.controls[field['id']].updateValueAndValidity()

      }
    }
  }

  resetForm(){
    this.validateFlag = false
    jQuery('.dtPick').val('')
    this.getSurveyData()
  }

  buildPost(){
    let post = {
      data: {
        master: this.surveyData['master']['id']
      },
      table: this.surveyData['master']['targetTable']
    }

    for( let field of this.surveyData['fields'] ){
      post['data'][field['targetField']] = this.form.value[field['id']] == '' ? null : this.form.value[field['id']]
    }

    this.saveSurvey(post)
  }

  saveSurvey( data ){
    this.loading['save'] = true

    this._api.restfulPut( data, `Survey/save`)
          .subscribe( res => {

            this.loading['save'] = false
            this.toastr.success( res['msg'], 'Guardado' )
            this.resetForm()

          }, err => {

            console.log('ERROR', err)

            this.loading['save'] = false

            let error = err.error
            this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
            console.error(err.statusText, error.msg)

          })
  }

  surveyHeight(){
    return document.getElementById('surveyDiv').clientHeight;
  }

  findIndex( arr, field, val ){
    let i = 0;
    for( let item of arr ){
      if( item[field] == val ){
        return i
      }
      i++
    }
    return -1
  }

  quickSet( arr ){
    for( let item of arr ){
      if( item ){
        this.form.controls[item[0]].setValue(item[1])
        this.resetChilds(item[0], item[1] )
      }
    }

    this.filterValue = ''
  }

  setVal( val, field ){
    this.form.controls[field].setValue(val.format('YYYY-MM-DD'))
  }

  setValDT( val, field, type ){

    let dt = ''
    switch( type ){
      case 'date':
        dt = `${val.format('YYYY-MM-DD')} ${this.form.controls[field].value ? moment(this.form.controls[field].value.substr(11,8)).format('HH:mm:ss') : '00:00:00'}`
        this.form.controls[field].setValue(dt)
        break
      case 'time':
        // console.log(val)
        dt = `${moment(`${this.form.controls[field].value ? moment(this.form.controls[field].value.substr(0,10)).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')} ${val}:00`).format('YYYY-MM-DD HH:mm:ss')}`
        this.form.controls[field].setValue(dt)
        break
    }

    // console.log(this.form.controls[field])
  }

  onSelectedAsesor(item, field){
    console.log(item)
    if(item){
      this.form.controls[field].setValue(item.Nombre)
    }
  }

  onSelectedAffiliate(item, field){
    if(item){
      this.form.controls[field].setValue(item.shortName + ' ' + item.description)
      let afs
      for( let fld of this.surveyData['fields'] ){
        if( fld['name'] == 'affiliateSiteId'){
          this.form.controls[fld['id']].setValue(item.idAffiliate)
          return false
        }
      }
    }
  }

}

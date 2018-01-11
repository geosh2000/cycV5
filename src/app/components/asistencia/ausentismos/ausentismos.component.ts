import { Component, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';


@Component({
  selector: 'app-ausentismos',
  templateUrl: './ausentismos.component.html',
  styles: []
})

export class AusentismosComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'payroll_prenomina'

  loading:Object = {}

  asesorShow:any
  nameShow:any

  dataTipos:any
  daysOpts:any

  index:Object = {}
  startDate:any
  dateSelected:any
  configDates:Object = {}

  configShow:boolean = false
  newShow:boolean = false


  protected searchStrName:string;
  protected dataServiceName:CompleterData;
  protected onSelected(item){
    this.asesorShow = item.originalObject.id
    this.nameShow = item.originalObject.ncorto

    this.index = {
      days      : 0,
      descansos : 0,
      bf        : 0
    }

    this.dateSelected = moment().format('YYYY-MM-DD')
    this.startDate = {
      year: parseInt(moment().format('YYYY')),
      month: parseInt(moment().format('MM')),
      day: parseInt(moment().format('DD'))
    }

    this.configShow = false
    this.newShow = true
  }

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                private completerService:CompleterService,
                public toastr: ToastsManager, vcr: ViewContainerRef ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    this.daysOpts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

    this.startDate = {
      year: parseInt(moment().format('YYYY')),
      month: parseInt(moment().format('MM')),
      day: parseInt(moment().format('DD'))
    }

    this.dateSelected = moment().format('YYYY-MM-DD')

  }

  ngOnInit() {
    if(this.currentUser != null){
      let currentUser = this.currentUser
      this.dataServiceName = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=name&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'name,user,ncorto', 'name')
    }

    this.getTipos()

  }

  userToName( user ){
    let name = user.replace( /[\.]/gmu, ' ')
    return name
  }

  getTipos(){

    this.loading['tipos'] = true

    this._api.restfulGet( '','Asistencia/tiposAusentismos' )
            .subscribe( res => {

              this.loading['tipos'] = false
              this.dataTipos = res.data

            }, err => {
              console.log("ERROR", err)

              this.loading['tipos'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })

  }

  chgType( index, type ){
    this.index[type] = index

    if( type == 'aus' ){
      this.index = {
        aus       : index,
        days      : 0,
        descansos : 0,
        bf        : 0
      }
    }
  }

  chgDate(){
    console.log("change")
    this.dateSelected = moment(`${this.startDate.year}-${this.startDate.month}-${this.startDate.day}`).format('YYYY-MM-DD')
  }

  config(){

    let start = moment(this.dateSelected)
    let d = this.daysOpts[this.index['descansos']],
        b = this.daysOpts[this.index['bf']],
        a = this.daysOpts[this.index['days']],
        totalDays = a + b + d

    this.configDates = {
      A: a,
      B: b,
      D: d,
      dates: {}
    }

    for(let i=0; i < totalDays; i++ ){

      if( b > 0 ){
        this.configDates['dates'][start.clone().add(i, 'days').format('YYYY-MM-DD')] = ""
        b--
      }else{
        if( d > 0 ){
          this.configDates['dates'][start.clone().add(i, 'days').format('YYYY-MM-DD')] = ""
          d--
        }else{
          this.configDates['dates'][start.clone().add(i, 'days').format('YYYY-MM-DD')] = ""
        }
      }
    }

    this.configShow = true
    this.autoFill()

  }

  btnClass( type, item ){
    let css = {
      A: {
            A: 'btn-outline-dark',
            B: 'btn-secondary',
            D: 'btn-secondary'
          },
      B: {
            A: 'btn-secondary',
            B: 'btn-outline-dark',
            D: 'btn-secondary'
          },
      D: {
            A: 'btn-secondary',
            B: 'btn-secondary',
            D: 'btn-outline-dark'
          },
      none: {
            A: 'btn-info',
            B: 'btn-primary',
            D: 'btn-warning'
          },
    }

    if( item == '' ){

      if( this.configDates[type] == 0 ){
        return 'btn-secondary'
      }

      return css['none'][type]
    }

    return css[type][item]
  }

  assign( type, date ){
    if( this.configDates['dates'][date] == type ){
      this.configDates['dates'][date] = ''
      this.configDates[type]++
    }else{
      this.configDates['dates'][date] = type
      this.configDates[type]--
    }

    this.autoFill()
  }

  autoFill(){
    if( this.configDates['D'] + this.configDates['B'] == 0 ){
      for(let item in this.configDates['dates']){
        if( this.configDates['dates'][item] == '' ){
          this.configDates['dates'][item] = 'A'
          this.configDates['A']--
        }
      }
    }
  }

  printDate( date, format ){
    return moment(date).format(format)
  }

  validateCreate(){
    if( this.index['aus'] >= 0 && this.index['days'] >= 1 && this.dateSelected ){
      return true
    }else{
      return false
    }
  }

  xld(){
    this.newShow = false
  }

}

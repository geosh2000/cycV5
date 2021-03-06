import { Component, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

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
  mainCredential:string = 'schedules_upload'

  loading:Object = {}

  asesorShow:any
  nameShow:any

  dataTipos:any
  daysOpts:any
  caso:any = ''
  notas:any = ''

  index:Object = {}
  startDate:any
  dateSelected:any
  diasPendientes:any
  configDates:Object = {}

  configShow:boolean = false
  newShow:boolean = false
  formData:any = []
  motivo:any


  protected searchStrName:string;
  protected onSelected(item){
    this.asesorShow = item.asesor
    this.nameShow = item.Nombre

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

    this.daysOpts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

    this.startDate = {
      year: parseInt(moment().format('YYYY')),
      month: parseInt(moment().format('MM')),
      day: parseInt(moment().format('DD'))
    }

    this.dateSelected = moment().format('YYYY-MM-DD')

  }

  ngOnInit() {

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
              this.dataTipos = res['data']

              console.log(this.dataTipos)

            }, err => {
              console.log("ERROR", err)

              this.loading['tipos'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })

  }

  chgType( index, type, motivo = '' ){
    this.index[type] = index

    if( type == 'aus' ){
      this.index = {
        aus       : index,
        days      : 0,
        descansos : 0,
        bf        : 0
      }

      if( this.dataTipos[index].Ausentismo == 'Descanso Pendiente' ){
        this.getPendientes()
      }
    }

    if( type == 'pendiente' ){
      this.index['days'] = 0
      this.motivo = motivo
      console.log( motivo )
    }

    if( type == 'days' ){
      this.index['descansos'] = 0
      this.index['bf'] = 0
    }
  }

  chgDate(){
    console.log("change")
    this.dateSelected = moment(`${this.startDate.year}-${this.startDate.month}-${this.startDate.day}`).format('YYYY-MM-DD')

    jQuery('#calendar').collapse('hide')
  }

  config(){

    let start = moment(this.dateSelected)
    let d = this.daysOpts[this.index['descansos']],
        b = this.daysOpts[this.index['bf']],
        a = this.daysOpts[this.index['days']],
        totalDays = a + b + d

    this.configDates = {
      A         : a,
      B         : b,
      D         : d,
      caso      : this.caso,
      comments  : this.notas,
      dates     : {}
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

    this.validateDates()

  }

  validateDates(){
    this.loading['config'] = true

    let params = {
      asesor  : this.asesorShow,
      dates   : []
    }
    for(let date in this.configDates['dates']){
      params.dates.push(date)
    }


    this._api.restfulPut( params, 'Asistencia/validateDates' )
            .subscribe( res => {

              this.loading['config'] = false
              if( res['data'] == 0 ){
                this.configShow = true
                this.autoFill()
              }else{
                this.toastr.error( "Existe un ausentismo que cruza con las fechas seleccionadas", `Fecha no asignable` )
              }

            }, err => {
              console.log("ERROR", err)

              this.loading['config'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
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

  xld( reset = true ){
    this.newShow = false
    this.caso = ''
    this.notas= ''
  }

  save(){
    this.loading['save'] = true

    let dates = []
    let i = 0

    for( let date in this.configDates['dates'] ){

      let type = {
        a: 0,
        b: 0,
        d: 0
      }
      type[ this.configDates['dates'][date].toLowerCase() ] = 1

      let arr = {
        asesor      : this.asesorShow,
        ausentismo  : this.dataTipos[this.index['aus']].id,
        Fecha       : `'${date}'`,
        a           : type['a'],
        b           : type['b'],
        d           : type['d'],
        caso        : `'${this.configDates['caso']}'`,
        comments    : `'${this.configDates['comments']}'`,
        changed_by  : this.currentUser.hcInfo.id
      }

      dates.push(arr)

      i++
    }

    this.formData = dates

    this.savePut()
  }

  savePut(){
    this.loading['save'] = true


    this._api.restfulPut( {'data': this.formData, 'motivo': this.motivo, 'dias': this.index['days'] } , 'Asistencia/saveAus' )
              .subscribe( res => {

                this.loading['save'] = false
                if( res['data'] ){
                  this.xld( false )
                  this.toastr.success( "Ausentismo guardado Correctamente", `Guardado` )
                }else{
                  this.toastr.error( "No se guardó correctamente", `Error` )
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['save'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getPendientes(){
    this.loading['pendientes'] = true

    this._api.restfulGet( this.asesorShow, 'Diaspendientes/getSummary' )
            .subscribe( res => {

              this.loading['pendientes'] = false

              if( parseInt(res['data'].disponibles) > 0 ){
                this.diasPendientes = parseInt(res['data'].disponibles)
                this.chgType(0, 'pendiente', 'Descanso Pendiente')
              }else{
                this.toastr.error( "Este asesor no cuenta con días pendientes por redimir o no alcanza los suficientes para cubrir 1 día", `Sin Pendientes` )
                this.index['aus'] = null
              }

              // console.log(res['data'])

            }, err => {
              console.log("ERROR", err)

              this.loading['pendientes'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

              this.index['aus'] = null

            })

  }

  showHistory(){
    jQuery('#ausHistoric').modal('show')
  }

}

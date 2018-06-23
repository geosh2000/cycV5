import { Component, OnDestroy, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pauses',
  templateUrl: './pauses.component.html',
  styles: []
})
export class PausesComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'monitor_gtr'
  timeout:any

  orderBy:string = 'nombre'
  orderDesc:boolean = false

  loading:any = {}
  dateMonitor:any
  dateMonRaw:Object = {
    year: '',
    month: '',
    day: ''
  }
  searchFilter:any = ''

  flagForm:boolean = false
  flagApply:boolean = false
  form = {
    caso: '',
    notas: '',
    pausa: '',
    asesor: ''
  }

  pauseData:any
  lu:any

  timerFlag:boolean = true
  killProcess:boolean = false
  timeCount:number = 180

  collectSize:number = 0
  page:number = 1

  pauseTypes:any

  constructor(public _api: ApiService,
                private _init:InitService,
                private titleService: Title,
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

    this.dateMonitor = moment().format('YYYY-MM-DD')

    this.dateMonRaw = {
      year: parseInt(moment().format('YYYY')),
      month: parseInt(moment().format('MM')),
      day: parseInt(moment().format('DD'))
    }

    this.getTipos()
    this.getPauses( this.dateMonitor )

  }

  run(){
      this.dateMonitor = moment(`${this.dateMonRaw['year']}-${this.dateMonRaw['month']}-${this.dateMonRaw['day']}`).format('YYYY-MM-DD')
      console.log(this.dateMonitor)
      this.getPauses( this.dateMonitor )
  }

  getPauses( date ){
    // console.log('getting pauses...')
    this.loading['Pauses'] = true
    this.timerFlag = false
    this.killProcess = true

    this._api.restfulGet( date, 'Pausemon/pauseMon' )
              .subscribe( res => {
                this.loading['Pauses'] = false
                this.loading['change'] = false
                this.pauseData = this.organizeData( res['data']['data'] )
                this.pagination()
                this.lu = res['data']['lu']

                this.killProcess = false
                this.timerFlag = true
                this.timeCount = 180
                this.timerLoad()

              }, err => {
                console.log("ERROR", err)

                this.killProcess = false
                this.timerFlag = true
                this.timeCount = 20
                this.timerLoad()

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['Pauses'] = false
                this.loading['change'] = false
              })


  }

  getTipos(){
    this._api.restfulGet( '', 'Pausemon/pauseTypes' )
              .subscribe( res => {

                this.pauseTypes = res['data']

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['Pauses'] = false
              })
  }

  organizeData( data ){

    let result = [], asesor = {}

    for( let item of data ){

      let pausa = {
        ACW                       : 0,
        'Pausa No Productiva'     : 0,
        Comida                    : 0,
        'Mesa de Hospitalidad'    : 0,
        'Charla con Supervisor'   : 0,
      }

      let over = {
        'ACW'                   : 0,
        'Pausa No Productiva'   : 0,
      }

      let review = 0

      pausa[item['Pausa']] = parseInt(item['dur_seconds'])/60

      if( (item['Pausa'] == 'ACW' && parseInt(item['dur_seconds']) >= 180) || (item['Pausa'] == 'Pausa No Productiva' && parseInt(item['dur_seconds']) >= 360)  ){
        over[item['Pausa']] = 1

        if( item['status'] == null ){
          review = 1
        }
      }

      if( asesor[item['asesor']] ){
        asesor[item['asesor']]['total ACW']     += pausa['ACW']
        asesor[item['asesor']]['total PNP']     += pausa['Pausa No Productiva']
        asesor[item['asesor']]['total Comida']  += pausa['Comida']
        asesor[item['asesor']]['total Mesa']    += pausa['Mesa de Hospitalidad']
        asesor[item['asesor']]['total Charla']  += pausa['Charla con Supervisor']
        asesor[item['asesor']]['total Pauses']++
        asesor[item['asesor']]['PNP over 5']    += over['Pausa No Productiva']
        asesor[item['asesor']]['ACW over 2']    += over['ACW']
        asesor[item['asesor']]['por revisar']   += review
      }else{
        asesor[item['asesor']] = {
            'asesor'        : item['asesor'],
            'nombre'        : item['Nombre'],
            'dep'           : item['Departamento'],
            'por revisar'   : review,
            'total Pauses'  : 1,
            'total PNP'     : pausa['Pausa No Productiva'],
            'PNP over 5'    : over['Pausa No Productiva'],
            'total ACW'     : pausa['ACW'],
            'ACW over 2'    : over['ACW'],
            'total Comida'  : pausa['Comida'],
            'total Mesa'    : pausa['Mesa de Hospitalidad'],
            'total Charla'  : pausa['Charla con Supervisor'],
            'pauses'        : []
        }
      }

      let asesorIndex = item['asesor']
      let pushItem = item

      pushItem['dur_min'] = parseFloat((parseInt(pushItem['dur_seconds'])/60).toFixed(2))

      delete pushItem['Nombre']
      delete pushItem['Departamento']
      delete pushItem['asesor']
      delete pushItem['dur_seconds']

      asesor[asesorIndex]['pauses'].push( pushItem )

    }

    for( let rac in asesor ){
      asesor[rac]['total PNP']    = asesor[rac]['total PNP'].toFixed(2)
      asesor[rac]['total ACW']    = asesor[rac]['total ACW'].toFixed(2)
      asesor[rac]['total Comida'] = asesor[rac]['total Comida'].toFixed(2)
      asesor[rac]['total Mesa']   = asesor[rac]['total Mesa'].toFixed(2)
      asesor[rac]['total Charla'] = asesor[rac]['total Charla'].toFixed(2)
      result.push( asesor[rac] )
    }

    // console.log(asesor)

    return result
  }

  alertClass( field, value, bool = false ){

    let reference = {
      'total PNP'   : 17,
      'total Comida': 30,
      'total Mesa'  : 45,
      'PNP over 5'  : 0,
      'ACW over 2'  : 0,
      'det Pausa No Productiva' : 5,
      'det ACW'                 : 2,
      'det Comida'              : 30,
      'det Mesa de Hospitalidad': 45,
      'por revisar'             : 0
    }

    if( reference[field] ){
      if( value > reference[field] ){
        if( field == 'por revisar'){

          if( bool ){
            return true
          }else{
            return 'bg-danger text-white animated flash infinite'
          }
        }

        if( bool ){
          return true
        }else{
          return 'bg-warning animated flash'
        }
      }
    }

    if( bool ){
      return false
    }else{
      return ''
    }

  }

  formatTime( time, format ){
    let show = moment.tz(time, 'America/Mexico_city')
    show.tz('America/Bogota')

    return( show.format( format ) )
  }

  justify( pausa, index, ixPausa ){
    let item = this.pauseData[index]

    this.flagForm = true
    this.flagApply = false

    this.form['ix'] = index
    this.form['ixPausa'] = ixPausa
    this.form['asesor'] = item['asesor']
    this.form['pausa'] = pausa
    this.form['caso'] = ' '
    this.form['notas'] = ' '
    this.form['fecha'] = this.dateMonitor
    this.form['status'] = 1

  }

  applySanc( pausa, index, ixPausa ){
    this.justify( pausa, index, ixPausa )
    setTimeout( () => {this.form['status'] = 2}, 200 )
    this.flagApply = true
  }

  saveJustify( del = false ){
    this.loading['saveJustify'] = true

    let api = 'Pausemon/justify'

    if( del ){
      api = 'Pausemon/delete'
    }

    this._api.restfulPut( this.form, api )
              .subscribe( res => {
                this.loading['saveJustify'] = false
                this.flagForm = false

                if( this.pauseData[this.form['ix']]['pauses'][this.form['ixPausa']]['status'] == null ){
                  if( !del ){
                    this.pauseData[this.form['ix']]['por revisar']--
                  }
                }else{
                  if( del ){
                    this.pauseData[this.form['ix']]['por revisar']++
                  }
                }

                // console.log( res )
                this.pauseData[this.form['ix']]['pauses'][this.form['ixPausa']]['status'] = this.form['status']
                this.pauseData[this.form['ix']]['pauses'][this.form['ixPausa']]['caso'] = this.form['caso']
                this.pauseData[this.form['ix']]['pauses'][this.form['ixPausa']]['notas'] = this.form['notas']
                this.pauseData[this.form['ix']]['pauses'][this.form['ixPausa']]['reg_by'] = 'Yo'

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['saveJustify'] = false
              })
  }

  deleteSanc( pausa, index, ixPausa ){
    this.justify( pausa, index, ixPausa )
    this.flagForm = false
    setTimeout( () => {
      this.form['status'] = null
      this.saveJustify( true )
    }, 200 )
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Monitor Pausas');
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  timerLoad( pause = false ){

    if( !this.killProcess ){
      if( this.timeCount <= 0 ){
          this.timeCount = 180
          this.getPauses( this.dateMonitor )

      }else{

        if( this.timerFlag ){
          this.timeCount--
        }
          this.timeout = setTimeout( () => {
          this.timerLoad()
          }, 1000 )
      }
    }
  }


  chgOrder( field ){
    if( field == this.orderBy ){
      this.orderDesc = !this.orderDesc
    }else{
      this.orderBy = field
      this.orderDesc = false
    }

    this.pauseData = this.orderObj( this.pauseData, field, this.orderDesc )

    this.pagination()
  }

  pagination(){
    this.collectSize = this.pauseData.length
  }

  orderObj( obj, field, desc = false ){

    let keys = []
    let index = {}
    let result = []

    for( let i in obj ){
      keys.push(`${obj[i][field]}|${obj[i]['nombre']}`)
      index[`${obj[i][field]}|${obj[i]['nombre']}`] = i
    }

    keys.sort()

    if( desc ){
      keys.reverse()
    }

    for(let k of keys){
      result.push(obj[index[k]])
    }

    return result
  }

  chgPause(pausa, type){
    let params = {
      id        : pausa,
      tipo      : type,
      changed_by: this.currentUser.hcInfo.id
    }

    this.loading = {
      change: pausa
    }

    this.timerFlag = false

    this._api.restfulPut( params, 'Pausemon/pauseChange' )
              .subscribe( res => {
                this.getPauses( this.dateMonitor)
              }, err => {
                console.log("ERROR", err)

                this.loading['change'] = false
                this.timerFlag = true

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
              })
  }

}

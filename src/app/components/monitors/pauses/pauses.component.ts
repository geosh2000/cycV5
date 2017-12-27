import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

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

  loading:any = {}
  dateMonitor:any
  dateMonRaw:Object = {
    year: '',
    month: '',
    day: ''
  }

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

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
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

    this.dateMonitor = moment().format('YYYY-MM-DD')

    this.dateMonRaw = {
      year: parseInt(moment().format('YYYY')),
      month: parseInt(moment().format('MM')),
      day: parseInt(moment().format('DD'))
    }

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

    this._api.restfulGet( date, 'Pausemon/pauseMon' )
              .subscribe( res => {
                this.loading['Pauses'] = false
                this.pauseData = this.organizeData( res.data['data'] )
                this.lu = res.data['lu']
                // console.log( this.pauseData )
                // console.log( res )

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['Pauses'] = false
              })

    setTimeout( () => this.getPauses( this.dateMonitor ), 150000 )
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
      'total PNP'   : 18,
      'total Comida': 31,
      'total Mesa'  : 46,
      'PNP over 5'  : 1,
      'ACW over 2'  : 1,
      'det Pausa No Productiva' : 6,
      'det ACW'                 : 3,
      'det Comida'              : 31,
      'det Mesa de Hospitalidad': 46,
      'por revisar'             : 1
    }

    if( reference[field] ){
      if( value >= reference[field] ){
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
  }

}
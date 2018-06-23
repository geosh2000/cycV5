import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {Observable} from 'rxjs';
import { ApiService } from '../../../../services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pause-detail',
  templateUrl: './pause-detail.component.html',
  styles: []
})
export class PauseDetailComponent implements OnInit {

  @Input() pause:any
  @Input() changer:any
  @Input() tipos:any
  @Input() date:any 
  @Input() asesor:any

  @Output() timer = new EventEmitter<any>()
  @Output() error = new EventEmitter<any>()
  @Output() changeP = new EventEmitter<any>()


  loading:Object = {}

  flagForm:boolean = false
  flagApply:boolean = false
  form = {
    caso: '',
    notas: '',
    pausa: '',
    asesor: ''
  }

  constructor(public _api: ApiService, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {

  }


  chgPause(pausa, type){
    let params = {
      id        : pausa,
      tipo      : type,
      changed_by: this.changer
    }

    this.loading = {
      change: pausa
    }

    this.setTimer(false)

    this._api.restfulPut( params, 'Pausemon/pauseChange' )
              .subscribe( res => {
                this.loading['change'] = false
                this.pause['tipo'] = params.tipo
                this.changeP.emit( this.asesor )
                this.ref.markForCheck();
                //get this pause
              }, err => {
                console.log("ERROR", err)

                this.loading['change'] = false
                this.error.emit( err )
              })
  }

  setTimer( event ){
    this.timer.emit( event )
  }

  timeToMin( time ){
    return (time/60).toFixed(2)
  }

  formatTime( time, format ){
    let show = moment.tz(time, 'America/Mexico_city')
    show.tz('America/Bogota')

    return( show.format( format ) )
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

                // console.log( res )
                this.pause['status'] = this.form['status']
                this.pause['caso'] = this.form['caso']
                this.pause['notas'] = this.form['notas']
                this.pause['reg_by'] = 'Yo'
                this.ref.markForCheck();
                this.changeP.emit( this.asesor )

              }, err => {
                console.log("ERROR", err)
                this.ref.markForCheck();
                this.error.emit( err )
                this.loading['saveJustify'] = false
              })
  }

  justify( pausa ){
    let item = this.pause

    this.flagForm = true
    this.flagApply = false

    this.form['asesor'] = item['asesor']
    this.form['pausa'] = pausa
    this.form['caso'] = ' '
    this.form['notas'] = ' '
    this.form['fecha'] = this.date
    this.form['status'] = 1

  }

  applySanc( pausa ){
    this.justify( pausa )
    setTimeout( () => {this.form['status'] = 2}, 200 )
    this.flagApply = true
  }

  deleteSanc( pausa ){
    this.justify( pausa )
    this.flagForm = false
    setTimeout( () => {
      this.form['status'] = null
      this.saveJustify( true )
    }, 200 )
  }

}

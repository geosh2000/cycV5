import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-jornadas',
  templateUrl: './jornadas.component.html',
  styles: []
})
export class JornadasComponent implements OnInit {

  @Input() showOpts:Object = {
                              ch_jornada:   false,
                              ch_comida:    false,
                              ch_excep:     false,
                              ch_ret:       false,
                              ch_sa:        false,
                              ch_x:         false,
                              sh_p:         false,
                              sh_d:         false
                            }
  @Input() asistData:Object = {}

  constructor() { }

  ngOnInit() {
  }

  formatDate(datetime, format){
    let time = moment.tz(datetime, "America/Mexico_City")
    let cunTime = time.clone().tz( "America/Bogota" )

    return cunTime.format(format)
  }

  progressProps( val, originalBg = 'primary' ){

    let bar: string
    let border: string

    if(val<60){
      bar    = 'danger'
    }else if(val<100){
      bar    = 'warning'
    }else{
      bar    = 'success'
    }

    if(originalBg == bar){
      border = 'light'
    }else{
      border = bar
    }

    return {bar: bar, border: border, val: val}
  }

  perCumplimiento( log ){

    let inicio = this.asistData[`${log}s`]
    let fin    = this.asistData[`${log}e`]
    let ji     = this.asistData[`${log}_login`]
    let jf     = this.asistData[`${log}_logout`]

    if( inicio == null  ||
        fin == null     ||
        ji == null      ||
        jf == null ){
      return 0
    }

    let s   = moment( inicio )
    let e   = moment( fin )
    let js  = moment( ji )
    let je  = moment( jf )

    let total = e.diff(s, 'seconds')

    let did = je.diff(js, 'seconds')
    let result:number = did / total * 100
    return (Math.floor(result))
  }

}

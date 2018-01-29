import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { ApiService } from '../../../services/api.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-horarios-semana',
  templateUrl: './horarios-semana.component.html',
  styles: [],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorariosSemanaComponent implements OnInit {

  @Input() asesor:any
  @Output() horarios = new EventEmitter<any>()

  loading:Object = {}
  horariosData:any
  datesData:any = []

  constructor(public _api: ApiService) {
    moment.locale('es');
  }

  getHorarios(){
    this.loading['horarios'] = true

    this._api.restfulGet( this.asesor, 'Asistencia/horarioAsesor' )
            .subscribe( res => {
              this.loading['horarios'] = false
              this.horariosData = res.data
              console.log(res.data)

              this.datesData = []

              for( let i = 0; i < 7; i++){
                this.datesData.push( moment().add(i, 'days').format('YYYY-MM-DD') )
              }
            }, err => {
              console.log("ERROR", err)

              this.loading['horarios'] = false

              let error = err.json()
              this.horarios.emit( {status: false, info: err} )
            })

  }

  ngOnChanges(changes: SimpleChanges) {
    this.getHorarios()
  }


  ngOnInit() {
  }

  printTime( date, format, tz = false ){
    if( tz ){
      return moment.tz(date, 'America/Mexico_city').tz('America/Bogota').format( format )
    }else{
      return moment(date).format( format )
    }
  }

}

import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { ApiService } from '../../../services/service.index';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-horarios-semana',
  templateUrl: './horarios-semana.component.html',
  styles: []
})
export class HorariosSemanaComponent implements OnInit {

  @Input() asesor:any
  @Output() horarios = new EventEmitter<any>()

  loading:Object = {}
  horariosData:any
  datesData:any = []
  fdow:any
  comida:boolean = true
  comidaSelect:boolean = true

  constructor(public _api: ApiService) {
    moment.locale('es');
    this.fdow = moment().subtract(parseInt(moment().format('E'))-1, 'days').format('YYYY-MM-DD')
  }

  getHorarios(){
    this.loading['horarios'] = true

    this._api.restfulGet( this.asesor, 'Asistencia/horarioAsesor' )
            .subscribe( res => {
              this.loading['horarios'] = false
              this.horariosData = res['data']

              this.datesData = []

              if( res['comida'] == 0 ){
                  this.comida = false
              }

              for( let i = 0; i < 7; i++){
                this.datesData.push( moment().add(i, 'days').format('YYYY-MM-DD') )
              }


            }, err => {
              console.log("ERROR", err)

              this.loading['horarios'] = false

              let error = err.json()
              this.horarios.emit( {status: false, info: err} )
            })

            if( parseInt(moment().format('E')) < 4 ){
              this.comidaSelect = true
            }else{
              this.comidaSelect = false
            }

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

  addTime( date, number, lapse, format ){
    return moment(date).add(number, lapse).format(format)
  }

  chgComida( event ){
    this.loading['comida'] = true

    let params = {
      asesor: this.asesor,
      comida: event
    }

    this._api.restfulPut( params, 'Asistencia/changeComida' )
            .subscribe( res => {
              this.loading['comida'] = false

            }, err => {
              console.log("ERROR", err)

              this.loading['comida'] = false
              this.comida = !event

              let error = err.json()
              this.horarios.emit( {status: false, info: err} )
            })
  }

}

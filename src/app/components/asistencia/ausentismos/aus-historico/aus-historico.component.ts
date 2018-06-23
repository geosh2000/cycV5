import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';

import { ApiService } from '../../../../services/service.index';
declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-aus-historico',
  templateUrl: './aus-historico.component.html',
  styles: []
})
export class AusHistoricoComponent implements OnInit {

  @Input() asesor:any
  @Input() nombre:any
  @Output() save = new EventEmitter<any>()

  loading:Object = {}
  confirmDel:Object = {}
  deleting:Object = {}
  dataAusentismos:any

  constructor(public _api: ApiService) {
    jQuery('#ausHistoric').modal('handleUpdate')
  }

  ngOnChanges(changes: SimpleChanges) {

    this.getAusentismos()
  }

  getAusentismos(){
    this.loading['ausentismos'] = true

    this._api.restfulGet( this.asesor, 'Asistencia/asesorAusentismos')
              .subscribe( res => {

                this.loading['ausentismos'] = false

                let result:Object = {}

                for(let aus of res['data']){
                  if( result[moment(aus.Inicio).format('YYYY')] ){
                    result[moment(aus.Inicio).format('YYYY')].push(aus)
                  }else{
                    result[moment(aus.Inicio).format('YYYY')] = [aus]
                  }
                }

                this.dataAusentismos = result
                console.log(result)
              }, err => {
                console.log("ERROR", err)

                this.loading['ausentismos'] = false

                let error = err.json()
                this.save.emit({status: false, err: err})
                console.error(err.statusText, error.msg)

              })
  }

  deleteAusentismos( id ){
    this.deleting[id] = true

    this._api.restfulDelete( id, 'Asistencia/delAusentismos')
              .subscribe( res => {

                this.deleting[id] = false
                this.getAusentismos()

              }, err => {
                console.log("ERROR", err)

                this.deleting[id] = false

                let error = err.json()
                this.save.emit({status: false, err: err})
                console.error(err.statusText, error.msg)

              })
  }

  confirmDelete( id, flag ){
    this.confirmDel[id] = flag
  }



  ngOnInit() {
  }

}

import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService } from '../../../../services/api.service';
import { InitService } from '../../../../services/init.service';
import { TokenCheckService } from '../../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-det-contrato',
  templateUrl: './det-contrato.component.html',
  styles: []
})
export class DetContratoComponent implements OnChanges {

  @Input() asesor:any
  @Output() error = new EventEmitter<any>()

  loading:Object = {}
  data:Object = {}
  contratos:Object = {}

  constructor(public _api: ApiService,
              public toastr: ToastsManager, vcr: ViewContainerRef,
              private _init:InitService) {

    this.toastr.setRootViewContainerRef(vcr);

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( this.asesor,'DetalleAsesores/contrato' )
              .subscribe( res => {

                this.loading['data'] = false
                this.data = res.data['actual']
                this.contratos = res.data['contratos']

              }, err => {
                console.log("ERROR", err)

                this.loading['data'] = false
                let error = err.json()
                this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                console.error(err.statusText, error.msg)

              })
  }

  printDate(date, format){
    return date ? moment.tz(date, 'America/Mexico_city').tz('America/Bogota').format(format) : '-'
  }

  err( data ){
    this.toastr.error(data.msg, data.code)
  }

  succ( data ){
    if( !data.toastrOff ){
      this.toastr.success( 'Solicitud guardada correctamente', 'Guardado!')
    }
    this.getData()
  }

}

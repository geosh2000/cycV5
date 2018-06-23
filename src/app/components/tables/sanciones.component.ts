import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';

declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/service.index';

@Component({
  selector: 'app-sanciones',
  templateUrl: './sanciones.component.html',
  styles: []
})
export class SancionesComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()

  asesor:number

  sancionDetail:any

  ready:boolean = false
  noRows:boolean = false

  constructor(private _api:ApiService) { }

  ngOnInit() {
  }

  buildForm( array ){
    this.asesor = array.idAsesor
    this.sancionDetail = []

    this.ready = false
    this.noRows = false

    this.getSanciones()
  }

  getSanciones(){
    this._api.restfulGet( this.asesor, `Sanciones/sanciones`)
            .subscribe( res => {

                this.ready = true

                if(res['status']){

                  if(res['rows'] != 0){

                    for(let sancion in res['data']){

                      this.sancionDetail[sancion] = res['data'][sancion]

                    }

                    // console.log("Sanciones", this.sancionDetail)
                    // console.log("RES", res)

                  }else{
                    this.noRows = true
                  }

              }else{
                console.error( res['msg'] )
              }
            })
  }

}

import { Component, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

@Component({
  selector: 'app-cambio-localizador-asesor',
  templateUrl: './cambio-localizador-asesor.component.html',
  styles: []
})
export class CambioLocalizadorAsesorComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'config_asignLoc'

  locs:any
  asesorShow:any
  nameShow:any
  creators:any

  result:any

  protected searchStrName:string;
  protected onSelected(item){
    this.asesorShow = item.asesor
    this.nameShow = item.Nombre
  }

  loading:Object = {}

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


  }

  ngOnInit() {
  }

  assign(){
    let localizadores:any = this.locs.split(',')
    let result = []

    for( let loc of localizadores ){
      result.push(loc.trim())
    }

    this.loading['getLocs'] = true

    this._api.restfulPut( result, 'Config/locCreator' )
              .subscribe( res => {
                this.loading['getLocs'] = false
                this.creators = []

                for( let item of res['data'] ){
                    let push = item
                    push['check'] = true
                    this.creators.push(push)
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['getLocs'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })

  }

  saveAssign(){
    let result = []

    for( let item of this.creators ){
        if(item.check){
          result.push(item.Localizador)
        }
    }

    let params = {locs: result, asesor: this.asesorShow }

    this.loading['saveLocs'] = true

    this._api.restfulPut( params, 'Config/locCreatorChange' )
              .subscribe( res => {
                this.loading['saveLocs'] = false

                this.updateGrafs()


                this.toastr.success( "Guardado" , res['msg'] )
                this.reset()

              }, err => {
                console.log("ERROR", err)

                this.loading['saveLocs'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  updateGrafs(){
    this.loading['updateGr'] = true
    this._api.restfulGet( `3/${this.asesorShow}`, 'Procesos/grafAsesores' )
            .subscribe( res => {
              this.loading['updateGr'] = false

              this.toastr.success( "Gráficas Actualizadas" , res['msg'] )
              this.updateMon()

            }, err => {
              console.log("ERROR", err)

              this.loading['updateGr'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  updateMon(){
    this.loading['updateMon'] = true
    this._api.restfulGet( `3/${moment().format('YYYY-MM-01')}/${moment().format('YYYY-MM-DD')}/${this.asesorShow}`, 'Procesos/grafPorAsesor' )
            .subscribe( res => {
              this.loading['updateMon'] = false

              this.toastr.success( "Monitor Actualizado" , res['msg'] )

            }, err => {
              console.log("ERROR", err)

              this.loading['updateMon'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  reset(){
    this.creators = []
  }

}

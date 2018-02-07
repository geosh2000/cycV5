import { Component, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

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
  protected dataServiceName:CompleterData;
  protected onSelected(item){
    this.asesorShow = item.originalObject.id
    this.nameShow = item.originalObject.ncorto
  }

  loading:Object = {}

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                private completerService:CompleterService,
                public toastr: ToastsManager, vcr: ViewContainerRef ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    if(this.currentUser != null){
      let currentUser = this.currentUser
      this.dataServiceName = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=name&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'name,user,ncorto', 'name')
    }

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


                this.toastr.success( "Guardado" , res.msg )
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

              this.toastr.success( "Gráficas Actualizadas" , res.msg )
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

              this.toastr.success( "Monitor Actualizado" , res.msg )

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

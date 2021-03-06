import { Component, OnInit } from '@angular/core';
import { InitService, ApiService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';

import * as Globals from '../../globals';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styles: []
})
export class UserPreferencesComponent implements OnInit {

  preferences:Object = {
    zonaHoraria: 0,
    colorProfile: 0
  }

  zhs:any
  show:boolean = false
  version:any = false

  constructor( public _init: InitService, private _api: ApiService, private toastr: ToastrService) {
    this.version = `${Globals.CYCTITLE} ${Globals.CYCYEAR} ${Globals.VER}`
  }

  ngOnInit() {
    setTimeout( () => {
      this.init()
      this.show = true
    }, 5000)
  }

  init(){
    this.getZones()
    this.preferences['zonaHoraria'] = parseInt(this._init.preferences['zonaHoraria'])
    this.preferences['colorProfile'] = parseInt(this._init.preferences['colorProfile'])
  }

  getZones(){
    this._api.restfulGet( '', 'Preferences/listZonasHorarias')
        .subscribe( res => {
          this.zhs = res['data']
        })
  }

  chgPref( pref, event ){
    this._api.restfulPut( { [pref]: event.target.value }, 'Preferences/setPref' )
        .subscribe( res => {
          this.toastr.success( 'Cambio Guardado', 'Guardado' )
          this._init.getPreferences()
          setTimeout(() => this.init(),2000)
        }, err => {
          console.log('ERROR', err)
          this.init()
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)

        })
  }



}

import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ZonaHorariaService {

  zone:any = 'America/Mexico_city'
  zoneIdx:any = 0
  isCun:boolean = false

  constructor( private _api:ApiService ) {}

  getZone( zone ){
    this._api.restfulGet( zone,'Preferences/zonasHorarias')
        .subscribe( res => {
          this.zone = res['data']['zonaHoraria']
          this.zoneIdx = zone
        })
    this.isCun = this.zone != 'America/Mexico_city' ? true : false
  }

}

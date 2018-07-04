import { Component, OnInit } from '@angular/core';

declare var jQuery:any;

import { ApiService, InitService } from '../../../services/service.index';

@Component({
  selector: 'app-live-tab',
  templateUrl: './live-tab.component.html',
  styles: []
})
export class LiveTabComponent implements OnInit {

  showContents:boolean = false;
  credentialStatus = 5;
  mainCredential="default"
  currentUser:any

  liveData:any
  lastUpdate:any
  loadingData:boolean = false

  chanNames:any = {
    ibMP: 'IN MP',
    ibMT: 'IN MT',
    ol:   'Online',
    us:   'OUT',
    PDV:  'PDV',
    Otro: 'Otros'
  }

  buttons:any = {
    ibMP: false,
    ibMT: false,
    ol:   false,
    us:   false,
    PDV:  false,
    Otro: false
  }

  constructor(
              private _api:ApiService,
              public _init:InitService) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.getData()

  }

  getData(){
    this.loadingData = true
    this._api.restfulGet( 'MX', 'VentaLive/liveData' )
            .subscribe( res => {
              console.log(res)
              if(res['status']){
                this.liveData = res['data']
                this.lastUpdate = res['lu']
              }

              this.loadingData = false

              setTimeout(()=>this.getData(),300000)

            })
  }

  ngOnInit() {
  }

  itemType( item ){
    if(item == 'Venta' || item == 'Monto' || item == 'Xld' || item == 'PDVIN' || item == 'PDVOUT' || item == 'PDVP' || item == 'INPDV'){
      return true
    }else{
      return false
    }
  }

  varData( canal, product, item, date ){
    let result = this.liveData[canal][product]['TD'][item] / this.liveData[canal][product][date][item]
    return result
  }

  shownItems( canal, item ){
    if( item == 'Venta' || item == 'Monto' || item == 'Xld' || item == 'Locs' ){
      return true;
    }else{
      switch(canal){
        case 'ibMP':
          if( item == 'INPDV' || item == 'INPDV_Locs'){
            return true
          }
          break
        case 'PDV':
          if( item == 'PDVIN' || item == 'PDVOUT' || item == 'PDVP' || item == 'PDVIN_Locs' || item == 'PDVOUT_Locs' || item == 'PDVP_Locs'){
            return true
          }
          break;
      }

      return false
    }
  }

  showConts( canal ){
    this.buttons[canal] = !this.buttons[canal]
    jQuery(`#${canal}_body`).collapse('toggle')
  }

}

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';
import { TokenCheckService } from '../../services/token-check.service';
import { CompleterService, CompleterData } from 'ng2-completer';

declare var jQuery:any;
import * as Globals from '../../globals';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  currentUser:any
  showContents:boolean = false
  mainCredential:string = 'default'

  @Input() tokenStatus:boolean

  token:boolean
  asesorShow:any
  nameShow:any = 'Yo'

  protected searchStrName:string;
  protected dataServiceName:CompleterData;
  protected onSelected(item){
    this.asesorShow = item.originalObject.id
    this.nameShow = item.originalObject.ncorto
  }

  constructor( private _api:ApiService,
                public _init:InitService,
                private _tokenCheck:TokenCheckService,
                private completerService:CompleterService,) {

    this.currentUser = this._init.getUserInfo()

    this.showContents = this._init.checkCredential( this.mainCredential, true )

    if(this.currentUser != null){
      let currentUser = this.currentUser
      this.dataServiceName = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=name&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'name,user,ncorto', 'name')
    }

    console.log(this.currentUser)

    this.asesorShow = this.currentUser.hcInfo.id
    this.nameShow = this.userToName( this.currentUser.username )

    this.token = this.tokenStatus

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {
          this.token = res.status

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

  ngOnChanges(changes: SimpleChanges) {
    this.token = this.tokenStatus
  }

  getToken(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = currentUser
    console.log(this.currentUser)
  }

  userToName( user ){
    let name = user.replace( /[\.]/gmu, ' ')
    return name
  }

}

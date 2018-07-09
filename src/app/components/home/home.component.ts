import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

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
  birthday = false

  @Input() tokenStatus:boolean

  token:boolean
  asesorShow:any
  nameShow:any = 'Yo'

  protected searchStrName:string;

  protected onSelected( item ){
    this.asesorShow = item.asesor
    this.nameShow = item.Nombre
    this.getBD( item.asesor )
  }

  constructor( private _api:ApiService,
                public _init:InitService,
                private _tokenCheck:TokenCheckService) {

    this.currentUser = this._init.getUserInfo()

    this.showContents = this._init.checkCredential( this.mainCredential, true )


    // console.log(this.currentUser)

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

      this.getBD()

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

  getBD( asesor? ){
    this._api.restfulGet( asesor ? asesor : '','Asesores/bd' )
              .subscribe( res =>{
                this.birthday = res['data']
              },
                (err) => {
                  let error = err
                  console.error(`${ error }`);
              });
  }

}

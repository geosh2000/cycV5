import {Component, ViewContainerRef, ViewChild} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ApiService, GlobalServicesService, InitService, TokenCheckService } from './services/service.index'
import { NavbarComponent } from './shared/navbar/navbar.component';

import * as Globals from './globals';
import { LogoutComponent } from './shared/logout/logout.component';
import { AvisosGlobalesComponent } from './shared/avisos-globales/avisos-globales.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  display: Object = {
    navbar  : true
  };

  @ViewChild(NavbarComponent) _nav:NavbarComponent
  @ViewChild(LogoutComponent) private _logout:LogoutComponent
  @ViewChild(AvisosGlobalesComponent) public _adv:AvisosGlobalesComponent


  private viewContainerRef: ViewContainerRef;

  opened:boolean = false
  advOpened:boolean = false
  token:boolean = false
  version:any
  reloadVer:boolean = false
  actualVersion:any
  myVersion:any

  currentUser:any
  showContents:boolean = false

  public constructor(
          private router: Router, private titleService: Title,
          private _api:ApiService,
          private _global: GlobalServicesService,
          private _init:InitService,
          private _tokenCheck:TokenCheckService,
          public toastr: ToastrService) {
            this.version = `${Globals.CYCTITLE} ${Globals.CYCYEAR} ${Globals.VER}`

            this.currentUser = this._init.getUserInfo()
            this.myVersion = Globals.VER

            this._tokenCheck.getTokenStatus()
                .subscribe( res => {

                  if( res.status ){
                    this.showContents = true
                  }else{
                    this.showContents = false
                  }
                })

            this.getVer()
            this.timerCheck()
          }

  getVer(){
    this._api.restfulGet( '', `Lists/cycVersion` )
            .subscribe( res => {
              let version = res['data']
              this.actualVersion = version['LastVer']
              if(Globals.VER != version['LastVer']){
                this.reloadVer = true
              }else{
                this.reloadVer = false
              }
              this.timerCheck()

            }, err => {
              console.log('ERROR', err)
              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)
              this.timerCheck()
            })
  }

  timerCheck(){
    setTimeout( () => this.getVer(), 10000)
  }

  openSideBar( flag ){
    this.opened = flag
  }

  openAdv( flag ){
    this.advOpened = flag
  }

  logout( id ){
    this._logout.logout( id )
  }

  confirmLO(h){
    this._nav.confirmLO(h)
  }

  refreshAdv(){
    this._adv.timerCount = 0
  }


}

import {Component, ViewContainerRef, ViewChild} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { GlobalServicesService } from './services/service.index'
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

  public constructor(
          private router: Router, private titleService: Title,
          private _global: GlobalServicesService,
          public toastr: ToastrService) {
            this.version = `${Globals.CYCTITLE} ${Globals.CYCYEAR} ${Globals.VER}`
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

import { Component, OnInit, ViewChild } from '@angular/core';

import { NavbarService, LoginService, TokenCheckService, ApiService } from '../../services/service.index';

import { Router, ActivatedRoute } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  @ViewChild(LogoutComponent) private _logout:LogoutComponent

  menu:any = [];
  test:string='NavBar Component success';
  l2menu:any[];
  l2flag:boolean = false;
  token:boolean=false;
  lastLog:boolean=false;
  expired= false;
  expiration
  licenses:any[]
  menuCredentials:Object
  bd:any

  currentUser:any

  constructor( private _navbar:NavbarService,
                private _tokenCheck:TokenCheckService,
                private _login:LoginService,
                private _api:ApiService,
                private route:Router ) {

                  this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

                }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.tokenCheck();

    setInterval(()=>{ this.tokenCheck() }  ,1000);

  }

  getBD(){
    this._api.restfulGet( '','Asesores/bd' )
              .subscribe( res =>{
                this.bd = res['data']
              },
                (err) => {
                  let error = err
                  console.error(`${ error }`);
              });
  }

  tokenCheck(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = currentUser

    // Check token exists
    if(!currentUser){
      this.token=false;
      if(this.lastLog){
        this.sendTokenStatus( false )
      }
      this.lastLog=false;
      this.menu = [];
    }else{
      // Check token expiration
      let now = new Date();
      let expire = new Date(`${currentUser.tokenExpire.replace(' ','T')}-05:00`);

      if(now<=expire){
        // Token Valid
        this.token=true;
        if(!this.lastLog){
          // console.log("Get Menu Again");
          this.getMenu(1);
          this.licenses = currentUser.credentials
          // console.log("Permisos", this.licenses)
          this.sendTokenStatus( true )
          this.lastLog=true;
          this.expired=false;
        }
      }else{
        this.expiration=`Now: ${now} || Expire: ${expire} || string dated: ${currentUser.tokenExpire.replace(' ','T')}`
        // Invalid Token
        this.token=false;
        this.lastLog=false;
        this.menu = [];
        this.expired= true;
        // Destroy token
        localStorage.removeItem('currentUser');
        this.sendTokenStatus( false );
      }


    }
  }

  getMenu( token ){
    this._navbar.getMenu( token )
          .subscribe( respuesta => {
            // console.log( respuesta );
            // console.log( respuesta[0][0] );
            // console.log( respuesta[1][respuesta[0][0][1].id] );

            // console.log( respuesta )
            this.menu = respuesta;
            this.buildCredentials( this.menu )
            // console.log("Menu", this.menu)
          });
    this.getBD()
  }

  buildCredentials( menu ){
    let creds: Object = {}

    creds[0] = this.credFalse( menu, 0 )
    creds[1] = this.credFalse( menu, 1 )
    creds[2] = this.credFalse( menu, 2 )

    let routes: Object = this.buildRoutes( menu )
    // console.log(routes)
    let flags: Object = {}
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    for ( let level in menu ){

      flags[level] = {}

      // tslint:disable-next-line:forin
      for ( let obj in menu[level]){

        for (let key in menu[level][obj]){

          if (currentUser.credentials[menu[level][obj][key]['credential']] == ''){
            this.menu[level][obj][key]['allow'] = true
          }else{
            if (currentUser.credentials[menu[level][obj][key]['credential']] == 1){

              if (routes[obj]){
                creds[routes[obj].level][routes[obj].obj][routes[obj].key] = true
              }

              this.menu[level][obj][key]['allow'] = true
            }else{

              flags[level][obj] = true
              this.menu[level][obj][key]['allow'] = false

            }
          }

        }

        // if(flags[level][obj]){
        //   creds[level][obj] = true
        // }

      }

    }

    this.menuCredentials = creds
    // console.log("Builded", creds)

  }

  buildRoutes( menu ){
    let routes: Object = {}

    for ( let level in menu ){

      for ( let obj in menu[level]){

        // tslint:disable-next-line:forin
        for (let key in menu[level][obj]){

          routes[menu[level][obj][key]['id']] = {}
          routes[menu[level][obj][key]['id']]['level'] = level
          routes[menu[level][obj][key]['id']]['obj'] = obj
          routes[menu[level][obj][key]['id']]['key'] = key

        }

      }

    }

    return routes

  }

  credFalse( menu, level ){

    let creds: Object = {}
    for ( let obj in menu[level]){
      creds[obj] = {}
      // tslint:disable-next-line:forin
      for (let key in menu[level][obj]){
        creds[obj][key] = false
      }
    }

    return creds
  }

  open2dLevel( menu ){
    if (menu){
      this.l2flag = true;
      this.l2menu = menu;
    }
  }
  close2dLevel(){
    this.l2flag = false;
  }



  logOut(){
    localStorage.removeItem('currentUser');
    this.tokenCheck();
  }

  sendTokenStatus( status: boolean ){
    this._tokenCheck.sendTokenStatus( status )
  }

  logout(){
    this._logout.logout( this.currentUser['hcInfo']['id'] )
    // this._logout.logout( 6 )
  }

  confirmLO( h ){
    if ( h ){
      this.tokenCheck();
    }
  }


}

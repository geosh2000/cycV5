import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { LoginService } from '../../services/login.service';
import { TokenCheckService } from '../../services/token-check.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  menu:any[] = [];
  test:string="NavBar Component success";
  l2menu:any[];
  l2flag:boolean = false;
  token:boolean=false;
  lastLog:boolean=false;
  expired=false;
  expiration
  licenses:any[]
  menuCredentials:Object

  constructor( private _navbar:NavbarService,
                private _tokenCheck:TokenCheckService,
                private _login:LoginService,
                private route:Router ) {

                  console.clear()

                }

  ngOnInit() {
    // console.log()

    this.tokenCheck();

    setInterval(()=>{ this.tokenCheck() }  ,1000);

  }

  tokenCheck(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    //Check token exists
    if(!currentUser){
      this.token=false;
      if(this.lastLog){
        this.sendTokenStatus( false )
      }
      this.lastLog=false;
      this.menu = [];
    }else{
      //Check token expiration
      let now = new Date();
      let expire = new Date(`${currentUser.tokenExpire.replace(' ','T')}-05:00`);

      if(now<=expire){
        //Token Valid
        this.token=true;
        if(!this.lastLog){
          // console.log("Get Menu Again");
          this.getMenu(1);
          this.licenses = currentUser.credentials
          console.log("Permisos", this.licenses)
          this.sendTokenStatus( true )
          this.lastLog=true;
          this.expired=false;
        }
      }else{
        this.expiration=`Now: ${now} || Expire: ${expire} || string dated: ${currentUser.tokenExpire.replace(' ','T')}`
        //Invalid Token
        this.token=false;
        this.lastLog=false;
        this.menu = [];
        this.expired=true;
        //Destroy token
        localStorage.removeItem('currentUser');
        this.sendTokenStatus( false );
      }


    }
  }

  getMenu( token ){
    this._navbar.getMenu( token )
          .subscribe( respuesta =>{
            // console.log( respuesta );
            // console.log( respuesta[0][0] );
            // console.log( respuesta[1][respuesta[0][0][1].id] );

            // console.log( respuesta )
            this.menu = respuesta;
            this.buildCredentials( this.menu )
            // console.log("Menu", this.menu)
          });
  }

  buildCredentials( menu ){
    let creds:Object = {}

    creds[0]=this.credFalse( menu, 0 )
    creds[1]=this.credFalse( menu, 1 )
    creds[2]=this.credFalse( menu, 2 )

    let routes:Object = this.buildRoutes( menu )
    // console.log(routes)
    let flags:Object = {}
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    for( let level in menu ){

      flags[level] = {}

      for ( let obj in menu[level]){

        for (let key in menu[level][obj]){

          if(currentUser.credentials[menu[level][obj][key]['credential']] == ""){
            this.menu[level][obj][key]['allow']=true
          }else{
            if(currentUser.credentials[menu[level][obj][key]['credential']] == 1){

              if(routes[obj]){
                creds[routes[obj].level][routes[obj].obj][routes[obj].key] = true
              }

              this.menu[level][obj][key]['allow']=true
            }else{

              flags[level][obj] = true
              this.menu[level][obj][key]['allow']=false

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
    let routes:Object = {}

    for( let level in menu ){

      for ( let obj in menu[level]){

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

    let creds:Object = {}
    for ( let obj in menu[level]){
      creds[obj] = {}
      for (let key in menu[level][obj]){
        creds[obj][key] = false
      }
    }

    return creds
  }

  open2dLevel( menu ){
    if(menu){
      this.l2flag=true;
      this.l2menu=menu;
    }
  }
  close2dLevel(){
    this.l2flag=false;
  }



  logOut(){
    localStorage.removeItem('currentUser');
    this.tokenCheck();
  }

  sendTokenStatus( status:boolean ){
    this._tokenCheck.sendTokenStatus( status )
  }




}

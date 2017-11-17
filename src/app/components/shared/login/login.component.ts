import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
declare var jQuery:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  login = {
    usn: "",
    usp: "",
    remember: ""
  }
  loginError:boolean = false;
  loginMsg:string = "";
  loginLoad = false

  constructor( private _login:LoginService, private _route:Router ) { }

  ngOnInit() {

  }

  validate( item ){
    console.log(item);
  }

  logIn( ){
    this.loginLoad = true
    let sourceUrl = this._route.url

    this._login.loginCyC( this.login )
      .subscribe( respuesta =>{
        this.loginLoad = false
        if(respuesta['tokenInfo'].status==0){
          this.loginError=true;
          this.loginMsg=respuesta['tokenInfo'].msg;
        }else{
          this.loginError=false;
          this.loginMsg="";
          jQuery("#loginModal").modal('hide');
          this._route.navigateByUrl('/home')
          this._route.navigateByUrl(sourceUrl)

        }
      });
    // console.log(this.login);
  }

  agregarNuevo( forma:NgForm ){

    forma.reset({
      casa:"Marvel"
    });
  }

}

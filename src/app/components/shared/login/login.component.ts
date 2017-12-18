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

    console.log(this.login)
    this._login.loginCyC( this.login )
      .subscribe( res =>{

                          this.loginLoad = false

                          if( !res.status ){
                            this.loginError=true;
                            this.loginMsg=res.msg;
                          }else{
                            this.loginError=false;
                            this.loginMsg="";
                            jQuery("#loginModal").modal('hide');
                            this._route.navigateByUrl('/home')
                            this._route.navigateByUrl(sourceUrl)

        }
      }, err => {

        if(err){
          this.loginLoad = false
          let error = err.json()
          this.loginError=true;
          this.loginMsg=error.msg;

          console.error(err.statusText, error.msg)

        }
      });
    // console.log(this.login);
  }


}

import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
declare var jQuery:any;

@Injectable()
export class InitService {

  constructor( private _route:Router) { }

  getUserInfo(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser
  }

  checkCredential( credential, main:boolean=false, test:boolean = false ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser == null){

      this.showLoginModal( )
      return false
    }

    if(currentUser.credentials['allmighty'] == 1 && !test){
      return true
    }

    if(currentUser.credentials[credential] == 1){
      return true
    }else{
      this.displayNoCredentials( main )
      return false
    }

  }

  showLoginModal( ){
    jQuery("#loginModal").modal('show');
  }

  displayNoCredentials( display ){
    if(display){
      jQuery("#noCredentials").modal('show');
      this._route.navigateByUrl('/home')
    }
  }

  checkSingleCredential( credential, main:boolean=false, test:boolean = false ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser == null){
      return false
    }

    if(currentUser.credentials['allmighty'] == 1 && !test){
      return true
    }

    if(currentUser.credentials[credential] == 1){
      return true
    }else{
      return false
    }

  }

}

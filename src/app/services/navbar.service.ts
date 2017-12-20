import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as Globals from '../globals';

@Injectable()
export class NavbarService {

  apiRestful:string = `${ Globals.APISERV }/api/${Globals.APIFOLDER}/index.php/`;

  constructor( private domSanitizer:DomSanitizer, private http:Http ) { }

  transform( url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl( url );
  }

  getMenu( token ){

    let url = `${ this.apiRestful }/Navbar/getMenu`
    let urlOK = this.transform( url )

    let headers = new Headers({
      'Content-Type':'application/json'
    });

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { headers } )
      .map( res => {
        return res.json();
      })


  }

}

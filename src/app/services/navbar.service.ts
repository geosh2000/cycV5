import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/Rx';
import * as Globals from '../globals';

@Injectable()
export class NavbarService {

  menuUrl:string = `${ Globals.APISERV }/ng2/json/navbar.json.php`;

  constructor( private http:Http ) { }

  getMenu( token ){

    let params = {
      token: token
    }

    let body = JSON.stringify( params );
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });

    return this.http.post( this.menuUrl, body, { headers } )
      .map( res => {
        // console.log(res.json());
        return res.json();
      })


  }

}

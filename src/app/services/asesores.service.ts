import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import * as Globals from '../globals';
import 'rxjs/Rx';

@Injectable()
export class AsesoresService {

  detailAsesoresUrl:string = `${ Globals.APISERV }/ng2/json/detalle.json.php`;
  getCredUrl:string = `${ Globals.APISERV }/ng2/getCredential.php`;
  progHorariosGetAsesoresUrl:string = `${ Globals.APISERV }/ng2/json/progHorarios.php`;

  constructor( private http:Http ) {

  }

  getDetailsAsesor( id ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${this.detailAsesoresUrl}?token=${currentUser.token}&usn=${currentUser.username}`

    let params={
      id: id
    }

    let body = JSON.stringify( params );
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });

    return this.http.post( url, body, { headers } )
      .map( res => {
        return res.json();
      })

  }

  getCredentials( credential ){
    let params = {
      cred: credential
    }

    let body = JSON.stringify( params );
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${this.getCredUrl}?token=${currentUser.token}&usn=${currentUser.username}`


    return this.http.post( url, body, { headers } )
      .map( res => {
        return res.json()
      })

  }

  progHorariosGetAsesores(){

    // let body = JSON.stringify( params );
    let body = "";
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });

    // let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // let url = `${this.getCredUrl}?token=${currentUser.token}&usn=${currentUser.username}`

    return this.http.post( this.progHorariosGetAsesoresUrl, body, { headers } )
      .map( res => {
        return res.json()
      })
  }



}

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import * as Globals from '../globals';
import 'rxjs/Rx';

@Injectable()
export class ApiService {

  apiUrl:string = `${ Globals.APISERV }/ng2/json/`;
  apiRestful:string = `${ Globals.APISERV }/api/restful/index.php/`;
  apiPostUrl:string = `${ Globals.APISERV }/ng2/post/`;

  constructor(
                private http:Http,
                private domSanitizer:DomSanitizer
              ) {

  }

  transform( url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl( url );
  }

  postFromApi( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiUrl }${ apiRoute }.json.php?token=${currentUser.token}&usn=${currentUser.username}`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    let body = JSON.stringify( params );
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
      .map( res => {
        // console.log(res)
        return res.json();
      })

  }

  postToApi( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiPostUrl }${ apiRoute }.post.php?token=${currentUser.token}&usn=${currentUser.username}`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    let body = JSON.stringify( params );
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
      .map( res => {
        return res.json();
      })

  }

  restfulPut( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}`
    // let url = `${ this.apiRestful }${ apiRoute }`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    let body = JSON.stringify( params );
    let headers = new Headers({
      'Content-Type':'application/json'
    });

    // console.log(params)
    return this.http.put( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
      .map( res => {
        // console.log( res.json() )
        return res.json()
      })
  }

  restfulPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}`
    // let url = `${ this.apiRestful }${ apiRoute }`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    let body = JSON.stringify( params );
    let headers = new Headers({
      'Content-Type':'application/json'
    });

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
      .map( res => {
        return res.json()
      })
  }

  restfulImgPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}`
    // let url = `${ this.apiRestful }${ apiRoute }`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    // let body = JSON.stringify( params );
    // let headers = new Headers({
    //   'Content-Type':'application/json'
    // });

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, params )
      .map( res => {
        return res.json()
      })
  }

  restfulDelete( id, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }/${ id }?token=${currentUser.token}&usn=${currentUser.username}`
    // let url = `${ this.apiRestful }${ apiRoute }`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    let headers = new Headers({
      'Content-Type':'application/json'
    });

    return this.http.delete( urlOK.changingThisBreaksApplicationSecurity, { headers } )
      .map( res => {
        return res.json()
      })
  }

  restfulGet( id, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }/${ id }?token=${currentUser.token}&usn=${currentUser.username}`
    // let url = `${ this.apiRestful }${ apiRoute }`
    let urlOK = this.transform( url )
    // console.log( urlOK.changingThisBreaksApplicationSecurity )

    let headers = new Headers({
      'Content-Type':'application/json'
    });

    // console.log(urlOK.changingThisBreaksApplicationSecurity)

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { headers } )
      .map( res => {
        return res.json()
      })
  }


  testApi( variable ){
    console.log( variable )
  }

}

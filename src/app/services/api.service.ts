import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import * as Globals from '../globals';
import { Observable } from 'rxjs';
import { map, catchError } from "rxjs/operators"

@Injectable()
export class ApiService {

  apiUrl:string = `${ Globals.APISERV }/ng2/json/`;
  apiRestful:string = `${ Globals.APISERV }/api/${Globals.APIFOLDER}/index.php/`;
  apiPostUrl:string = `${ Globals.APISERV }/ng2/post/`;
  qmAPI:string = `http://queuemetrics.pricetravel.com.mx:8080/queuemetricscc/`;

  constructor(
                private http:HttpClient,
                private domSanitizer:DomSanitizer
              ) {

  }

  transform( url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl( url );
  }

  postFromApi( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiUrl }${ apiRoute }.json.php?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}`
    let urlOK = this.transform( url )

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({});

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }

  postToApi( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiPostUrl }${ apiRoute }.post.php?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}`
    let urlOK = this.transform( url )

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({});

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => { return res } )
        )

  }

  restfulPut( params, apiRoute, loginReq = true ){

    let url

    if( loginReq ){
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}&usid=${currentUser.hcInfo.id}`
    }else{
      url = `${ this.apiRestful }${ apiRoute }`
    }

    let urlOK = this.transform( url )

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.put( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }

  restfulPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}`

    let urlOK = this.transform( url )

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }

  restfulImgPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}`

    let urlOK = this.transform( url )

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, params )
        .pipe(
           map( res => { return res } )
        )
  }

  restfulDelete( id, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }/${ id }?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}`

    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.delete( urlOK.changingThisBreaksApplicationSecurity, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }

  restfulGet( id, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }/${ id }?token=${currentUser.token}&usn=${currentUser.username}&usid=${currentUser.hcInfo.id}`

    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }

  testGet(  ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ Globals.APISERV }/api/${Globals.APIFOLDER}/test.php`

    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }

  qmGet( params, qmModule ){

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    let body = JSON.stringify( params );
    let url = `${ this.qmAPI }${ qmModule }`
    let urlOK = this.transform( url )

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers: headers } )
        .pipe(
           map( res => { return res } )
        )
  }


  testApi( variable ){
    console.log( variable )
  }

}

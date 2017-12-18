import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import * as Globals from '../globals';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {

  apiUrl:string = `${ Globals.APISERV }/ng2/json/`;
  apiRestful:string = `${ Globals.APISERV }/api/${Globals.APIFOLDER}/index.php/`;
  apiPostUrl:string = `${ Globals.APISERV }/ng2/post/`;
  qmAPI:string = `http://queuemetrics.pricetravel.com.mx:8080/queuemetricscc/`;

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

  restfulPut( params, apiRoute, loginReq = true ){

    let url

    if( loginReq ){
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      url = `${ this.apiRestful }${ apiRoute }?token=${currentUser.token}&usn=${currentUser.username}`
    }else{
      url = `${ this.apiRestful }${ apiRoute }`
    }

    let urlOK = this.transform( url )

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

  testGet(  ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ Globals.APISERV }/api/${Globals.APIFOLDER}/test.php`
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

  qmGet( params, qmModule ){

    let headers = new Headers({
      'Content-Type':'application/json'
    });
    // headers.append("Authorization", "Basic " + btoa('robot' + ":" + 'robot'));


    console.log(headers)

    let body = JSON.stringify( params );
    let url = `${ this.qmAPI }${ qmModule }`
    let urlOK = this.transform( url )


    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers: headers } )
      .map( res => {
        return res.json()
      })
  }


  testApi( variable ){
    console.log( variable )
  }

}

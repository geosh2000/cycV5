import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import * as Globals from '../globals';
import { map, catchError } from 'rxjs/operators'

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

  postFromApi( params, apiRoute, alternativeRoute? ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiUrl }${ apiRoute }.json.php?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`
    let urlOK = this.transform( url )

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({});

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => res )
        )
  }

  postToApi( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiPostUrl }${ apiRoute }.post.php?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`
    let urlOK = this.transform( url )

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({});

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => res )
        )

  }

  restfulPut( params, apiRoute, loginReq = true ){

    let url

    if( loginReq ){
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      url = `${ this.apiRestful }${ apiRoute }?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`
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
           map( res => res )
        )
  }

  restfulPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`

    let urlOK = this.transform( url )

    let body = JSON.stringify( params );

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => res )
        )
  }

  helpPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = 'http://help.pricetravel.com.mx/rest/api/2/issue/'

    let urlOK = this.transform( url )

    let body = JSON.stringify( params );

    let headers = new HttpHeaders({
        'Content-Type':'application/json',
        'Authorization':'Basic YWxiZXJ0LnNhbmNoZXo6QER5ajIxMjc4Mzcw'
      });


    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => res )
        )
  }

  restfulImgPost( params, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`

    let urlOK = this.transform( url )

    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, params )
        .pipe(
           map( res => res )
        )
  }

  restfulDelete( id, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }/${ id }?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`

    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.delete( urlOK.changingThisBreaksApplicationSecurity, { headers } )
        .pipe(
           map( res => res )
        )
  }

  restfulGet( id, apiRoute ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${ this.apiRestful }${ apiRoute }/${ id }?token=${currentUser ? currentUser.token : 'noToken'}&usn=${currentUser ? currentUser.username : 'noUser'}&usid=${currentUser ? currentUser.hcInfo.id : 'noId'}`

    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { headers } )
        .pipe(
           map( res => res )
        )
  }

  getFile( id, apiRoute, test = false ){

    let url = test ? '/assets/test.xlsx' : `${ Globals.APISERV }/${ apiRoute }/${ id }`

    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { responseType: 'arraybuffer'  } )
        .pipe(
           map( res => res )
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
           map( res => res )
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
           map( res => res )
        )
  }


  testApi( variable ){
    console.log( variable )
  }

}

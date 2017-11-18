import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import * as Globals from '../globals';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoginService {

  getTokenUrl:string = `${ Globals.APISERV }/ng2/genToken.php`;

  constructor( private http:Http ) { }

  loginCyC( logInfo ){

    let body = JSON.stringify( logInfo );
    let headers = new Headers({
      // 'Content-Type':'application/json'
    });

    // console.log(body);

    return this.http.post( this.getTokenUrl, body, { headers } )
      .map( res => {
        if(res.json().status==1){

          let usn

          if(logInfo.usn.indexOf('@')>0){
            usn = logInfo.usn.substr(0,logInfo.usn.indexOf('@'))
          }else{
            usn = logInfo.usn
          }



          localStorage.setItem(
                                'currentUser',
                                JSON.stringify({
                                                token: res.json().token,
                                                tokenExpire: res.json().tokenExpire,
                                                username: usn, hcInfo: res.json().hcInfo,
                                                credentials: res.json().credentials
                                              })
                              );
        }else{
          console.log("msg");
          console.log(res.json().msg);
        }

        let result = {
          tokenInfo: res.json(),
          username: logInfo.usn
        }

        return result;


      })

  }



}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

@Injectable()
export class LoginService {

  constructor( private _api:ApiService ) { }

  loginCyC( logInfo ){

    let result

    return this._api.restfulPut( logInfo, 'Login/login', false )
      .map( res => {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
                          token: res['token'],
                          tokenExpire: res['tokenExpire'],
                          username: res['username'],
                          hcInfo: res['hcInfo'],
                          credentials: res['credentials']
                        })
        );

          return { status: true, msg: 'Logueo Correcto', err: 'NA' }
      }, err => {

        if(err){
          let error = err.json()
          console.error(err.statusText, error.msg)

          return { status: false, msg: error.msg, err: err.statusText }
        }
      })

  }



}

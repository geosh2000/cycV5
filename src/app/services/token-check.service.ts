import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class TokenCheckService {

  private subject = new Subject<any>();

  sendTokenStatus( status:boolean ){
    this.subject.next({ status })
    console.log(`Token Status Recieved: ${ status }`)
  }

  getTokenStatus(): Observable<any>{
    return this.subject.asObservable();
  }

  constructor(  ) { }

}

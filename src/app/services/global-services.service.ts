import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/subject';

@Injectable()
export class GlobalServicesService {

  monitorDisplay = new Subject<boolean>();

  constructor() {
    this.monitorDisplay.next(false)
  }

  displayMonitor( flag ){
    this.monitorDisplay.next(flag)
  }

  getMonitorStatus(): Observable<any>{
    return this.monitorDisplay.asObservable();
  }



}

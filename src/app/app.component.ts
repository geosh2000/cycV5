import {Component, ViewContainerRef} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { GlobalServicesService } from './services/global-services.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app'
  display:Object = {
    navbar  : true
  }

  private viewContainerRef: ViewContainerRef;

  public constructor(
          private router: Router, private titleService: Title,
          private _global: GlobalServicesService,
          public toastr: ToastrService) {  }

  displayMonitor( flag ){
    this.display['navbar'] = !flag
    console.log("display", flag)
  }

}

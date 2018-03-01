import {Component, ViewContainerRef} from '@angular/core';
import {ToastsManager} from 'ng2-toastr';

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
          private _global: GlobalServicesService,
          public toastr: ToastsManager,
          viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;

    this.toastr.setRootViewContainerRef(viewContainerRef);

  }

  displayMonitor( flag ){
    this.display['navbar'] = !flag
    console.log("display", flag)
  }

}

import {Component, ViewContainerRef} from '@angular/core';
import {ToastsManager} from 'ng2-toastr';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { GlobalServicesService } from '../../../services/global-services.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styles: []
})
export class MainComponent {
  title = 'app';
  display: Object = {
    navbar  : true
  };

  private viewContainerRef: ViewContainerRef;

  public constructor(
          private router: Router, private titleService: Title,
          private _global: GlobalServicesService,
          public toastr: ToastsManager,
          viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;

    this.toastr.setRootViewContainerRef(viewContainerRef);

  }

  displayMonitor( flag ) {
    this.display['navbar'] = !flag;
    console.log('display', flag);
  }

}

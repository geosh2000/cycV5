import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

declare var jQuery:any;
import * as moment from 'moment-timezone';

import { CxcPayDetailComponent } from '../../cxc/cxc-pay-detail/cxc-pay-detail.component';
import { ApiService } from '../../../services/service.index';

@Component({
  selector: 'app-home-cxc-view',
  templateUrl: './home-cxc-view.component.html',
  styles: []
})
export class HomeCxcViewComponent implements OnInit, OnChanges {

  @ViewChild(CxcPayDetailComponent) _detail:CxcPayDetailComponent
  @Input() asesor:any

  loading:Object = {}
  data:any = []

  constructor( private _api:ApiService, private toastr:ToastrService ) {

  }

  ngOnInit() {
    this.getData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getData()
  }

  getData( asesor = this.asesor ){

    this.loading['data'] = true

    this._api.restfulGet( asesor, `Cxc/cxcAsesor`)
          .subscribe( res => {

            this.loading['data'] = false
            this.data = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['data'] = false

            let error = err.error
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })

  }

  formatTitle(title){
    return title.replace(/([A-Z])/g, ' $1').trim()
  }

}

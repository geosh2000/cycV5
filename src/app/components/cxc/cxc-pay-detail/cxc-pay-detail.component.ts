import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService } from '../../../services/service.index';

declare var jQuery:any;

@Component({
  selector: 'app-cxc-pay-detail',
  templateUrl: './cxc-pay-detail.component.html',
  styles: []
})
export class CxcPayDetailComponent implements OnInit {

  data:any = []
  id:any
  loading:Object = {}

  constructor( private _api: ApiService, private toastr:ToastrService ) { }

  ngOnInit() {
  }

  build( id ){
    this.id = id
    this.getData()
  }


  getData(){
    this.loading['data'] = true
    jQuery('#payDetailModal').modal('show')
    this._api.restfulGet( `-1/${this.id}/1`, `Cxc/cxcCorte`)
          .subscribe( res => {

            this.loading['data'] = false
            this.data = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['data'] = false

            let error = err.error
            this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
            console.error(err.statusText, error.msg)

          })
  }

  formatTitle(title){
    return title.replace(/([A-Z])/g, ' $1').trim()
  }
}

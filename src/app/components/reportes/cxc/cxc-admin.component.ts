import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

import { CorteComponent } from './corte.component';
import { UploadImageComponent } from '../../formularios/upload-image.component';

@Component({
  selector: 'app-components',
  templateUrl: './cxc-admin.component.html',
  styles: []
})
export class CxcAdminComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent
  @ViewChild( CorteComponent ) private _corte: CorteComponent
  @ViewChild( UploadImageComponent ) private _upImg: UploadImageComponent

  showContents:boolean = false
  mainCredential:string = 'default'
  currentUser:any

  listCortes:any
  listCortesFlag:boolean = false

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
                public _api:ApiService,
                private _init:InitService,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                public route:Router,
                public activatedRoute:ActivatedRoute
                ){

    this.toastr.setRootViewContainerRef(vcr);

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

  }

  ngOnInit() {
    this.getCortes()
  }

  getCortes(){
    this._api.restfulGet( '', 'Nomina/listCortes' )
            .subscribe( res => {
              if(res['status']){
                this.listCortes = res['data']
                this.listCortesFlag = true
              }else{
                console.error( res )
              }
            })
  }

  selectedCorte( event ){
    this._corte.build( event.target.value )
  }

  showMsg( event ){
    this.toastr.error(`${ event.msg }`, `${ event.title.toUpperCase() }!`);
    console.log("Toaster", event)
  }

  showUploadModal( title, dir, fileName ){
    this._upImg.build( title, dir, fileName )
    jQuery('#formUploadImageComponent').modal('show')
  }

}

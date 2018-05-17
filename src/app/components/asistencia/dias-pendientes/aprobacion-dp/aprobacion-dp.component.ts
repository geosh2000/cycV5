import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { ApiService } from '../../../../services/api.service';
import { InitService } from '../../../../services/init.service';
import { TokenCheckService } from '../../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../../globals';

@Component({
  selector: 'app-aprobacion-dp',
  templateUrl: './aprobacion-dp.component.html',
  styles: []
})
export class AprobacionDpComponent implements OnInit {

  @Input() item:any
  @Output() result = new EventEmitter<any>()

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  large:boolean = true
  mainCredential:string = 'schedules_approbe_dp'

  loading:Object = {}
  approbeData:Object = {}

  constructor(public _api: ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager, vcr: ViewContainerRef) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    moment.locale('es-MX')
  }

  ngOnInit() {
  }

  setApprobe( item, status ){
    this.loading['toApprobe'] = true

    let itemOK = JSON.parse(JSON.stringify(item))
    delete itemOK['Nombre']
    delete itemOK['creador']

    let params = {
      item: itemOK,
      status: status
    }

    this._api.restfulPut( params, 'Diaspendientes/approbe' )
              .subscribe( res => {

                this.loading['toApprobe'] = false
                this.result.emit({status: true, msg: status==1 ? 'Dias Aprobados Correctamente' : 'Solicitud Denegada'})

              }, err => {
                console.log("ERROR", err)

                this.loading['toApprobe'] = false

                let error = err.json()
                this.result.emit({status: false, msg: error.msg})
                console.error(err.statusText, error.msg)

              })
  }

}

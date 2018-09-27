import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

import { CxcAprobeComponent } from '../cxc-aprobe/cxc-aprobe.component';


@Component({
  selector: 'app-cxc-aplicables',
  templateUrl: './cxc-aplicables.component.html',
  styles: [`
    .custom-day {
      text-align: center;
      padding: 0.185rem 0.25rem;
      display: inline-block;
      height: 2rem;
      width: 2rem;
    }
    .custom-day.focused {
      background-color: #e6e6e6;
    }
    .custom-day.range, .custom-day:hover {
      background-color: rgb(2, 117, 216);
      color: white;
    }
    .custom-day.faded {
      background-color: rgba(2, 117, 216, 0.5);
    }
  `],
})
export class CxcAplicablesComponent implements OnInit {

  @ViewChild(CxcAprobeComponent) public _aprobe:CxcAprobeComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'cxc_apply'

  pdvSearch:boolean = false

  loading:Object = {
    linkcxc: {},
    save: {}
  }

  data:any = []
  dataLink:any = []

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  documentImage:any
  imageTitle:any

  constructor(public _api: ApiService,
                public _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                private route:Router,
                private activatedRoute:ActivatedRoute,
                public toastr: ToastrService) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery('#loginModal').modal('show');
          }
        })

    this.activatedRoute.params.subscribe( params => {
      if( params.id ){
        // this.selected['id']     = params.id
      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Aplicación CXC');
  }

  getData( flag = this.pdvSearch ){

    this.pdvSearch = flag
    this.loading['data'] = true

    this._api.restfulGet( flag ? 29 : 0, `Cxc/searchApply`)
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

  viewCxc( flag = false, id ){
      let d = new Date()
      this.documentImage=`${Globals.APISERV}/img/cxc/${id}.jpg?${d.getTime()}`
      this.imageTitle = id
      jQuery('#showDocument').modal('show')
  }

  aprobe( item ){
    this._aprobe.build( item )
  }

  saveAprobe( event ){
    if( event.status ){
      this.updateRegs( 'id', event.id, 'status', 2 )
      this.toastr.success('Cxc Aplicado', 'Guardado')
    }
  }

  updateRegs( compare, compareVal, field, val ){
    for( let item of this.data ){
      if( item[compare] == compareVal ){
        item[field] = val
      }
    }
  }

  updateImg(event){
    let d = new Date()
    if(this.imageTitle != null){
      this.documentImage=`${Globals.APISERV}/img/asesores/${this.imageTitle}.jpg?${d.getTime()}`
    }
  }



}

import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, Output, SimpleChanges, HostListener, ElementRef, Injectable, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

@Component({
  selector: 'app-cxc-link',
  templateUrl: './cxc-link.component.html',
  styles: []
})
export class CxcLinkComponent implements OnInit {

  @Output() save = new EventEmitter
  @Output() add = new EventEmitter

  loading:Object = {
    linkcxc: {}
  }

  dataLinkData:any = []

  linkLoc:any
  linkId:any
  linkCxcLinkId:any
  linkRev:any

  constructor(public _api: ApiService,
                public _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                private route:Router,
                private activatedRoute:ActivatedRoute,
                public toastr: ToastrService) {

  }

  ngOnInit() {
  }

  open( loc, id, link, rev = 0 ){
      this.loading['link'] = true
      this.linkLoc = loc
      this.linkId = id
      this.linkCxcLinkId = link
      this.dataLinkData = []
      this.linkRev = rev

      jQuery('#linkModal').modal('show')

      console.log(loc)

      this._api.restfulGet( `${loc}/${this.linkRev}`, `Cxc/transactions`)
            .subscribe( res => {

              this.loading['link'] = false
              console.log(res)
              this.dataLinkData = res['data']

            }, err => {

              console.log('ERROR', err)

              this.loading['link'] = false

              let error = err.json()
              this.toastr.error( error.msg, err.statusText )
              console.error(err.statusText, error.msg)

            })
  }

  linkCxc( id, rev = 0 ){
    this.loading['linkCxc'] = true

    let tx = this.linkRev == 0 ? this.linkId : id
    let cxc = this.linkRev == 0 ? id : this.linkId

    this._api.restfulGet( `${tx}/${cxc}/${this.linkRev}`, `Cxc/link`)
          .subscribe( res => {

            this.loading['linkCxc'] = false
            this.toastr.success( 'Cxc ligado correctamente', 'Guardado' )

            if( this.linkRev == 0 ){
              jQuery('#linkModal').modal('hide')
              this.save.emit({status: true})
            }else{
              this.open(this.linkLoc,this.linkId,this.linkCxcLinkId,this.linkRev)
            }

          }, err => {

            console.log('ERROR', err)

            this.loading['linkCxc'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })

  }

  unlinkCxc( id, rev = 0 ){
    this.loading['linkcxc'][id] = true

    let tx = this.linkRev == 0 ? this.linkId : id
    let cxc = this.linkRev == 0 ? id : this.linkId

    this._api.restfulGet( `${tx}/${cxc}/${this.linkRev}`, `Cxc/unlink`)
          .subscribe( res => {

            this.loading['linkcxc'][id] = false
            this.toastr.success( 'Cxc desligado correctamente', 'Guardado' )
            if( this.linkRev == 0 ){
              jQuery('#linkModal').modal('hide')
              this.save.emit({status: true})
            }else{
              this.open(this.linkLoc,this.linkId,this.linkCxcLinkId,this.linkRev)
            }

          }, err => {

            console.log('ERROR', err)

            this.loading['linkcxc'][id] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })

  }

  closeModal( reload = true ){
    jQuery('#linkModal').modal('hide')

    if(reload){this.save.emit({status: true})}
  }

  addCxC(){
    this.add.emit( this.linkLoc )
  }

}

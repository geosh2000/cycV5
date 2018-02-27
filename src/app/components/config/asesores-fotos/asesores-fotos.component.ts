import { Component, OnInit, ViewContainerRef, ViewChild, Injectable, NgZone, AfterViewInit } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { UploadImageComponent } from '../../formularios/upload-image.component';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import * as Globals from '../../../globals';
import * as moment from 'moment-timezone';
declare var jQuery:any;

@Component({
  selector: 'app-asesores-fotos',
  templateUrl: './asesores-fotos.component.html',
  styles: []
})
export class AsesoresFotosComponent implements OnInit {

  @ViewChild(UploadImageComponent) _image:UploadImageComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'hc_edit_detalles'

  loading:Object = {}

  list:any
  titles:any
  asesorImage:any
  indexChange:any
  pdv:boolean = false
  missing:boolean = false

  constructor( public _api: ApiService,
                private _init:InitService,
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
          }
        })

  }

  ngOnInit() {
    this.getData()
  }

  getData( pdv = this.pdv ){
    this.loading['list'] = true

    this._api.restfulGet( pdv ? 1 : 0, 'Headcount/photoList' )
            .subscribe( res => {

              this.loading['list'] = false
              this.list = res.data['data']
              this.titles = res.data['titles']


            }, err => {
              console.log("ERROR", err)

              this.loading['list'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  uploadFoto( num, name, index ){
    this._image.build( `Foto para ${ name }`, 'asesores', num )
    this.indexChange = index
  }

  upldCheck( event ){
    if( event.ERR ){
      this.toastr.error( event.msg, 'ERROR' )
    }else{
      this.toastr.success( 'Imagen cargada', 'OK' )
      this.list[this.indexChange]['exists'] = true
    }
  }

  preview( num ){
    let d = new Date()
    this.asesorImage = `${Globals.APISERV}/img/asesores/${num}.jpg?${d.getTime()}`
    console.log( this.asesorImage )
    // jQuery('#fotoModal').modal('show')
  }


}

import { Component, OnDestroy, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import {NgbCarouselConfig} from '@ng-bootstrap/ng-bootstrap';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-venta-por-asesor',
  templateUrl: './venta-por-asesor.component.html',
  styles: [],
  providers: [NgbCarouselConfig]
})
export class VentaPorAsesorComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'default'
  timeout:any

  loading:Object = {}
  LU:any

  dataDeps:any
  dataSups:any
  dataAsesor:any
  dataMetas:any
  numAsesores:any

  dep:any
  sup:any

  timerFlag:boolean = false
  timeCount:number = 60

  screen:boolean=false

  slides = [0,4,8,12,16,20]

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                public sdConfig: NgbCarouselConfig) {

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

        sdConfig.interval = 20000;
        sdConfig.wrap = true;
  }

  ngOnInit() {
    this.getDeps()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getDeps( ){
    this.loading['deps'] = true

    this._api.restfulGet( '', 'Headcount/Fdepartamentos')
              .subscribe( res => {

                this.loading['deps'] = false

                this.dataDeps = res.data

              }, err => {
                console.log("ERROR", err)

                this.loading['deps'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  getSups( dep ){

    this.loading['sups'] = true

    this._api.restfulGet( dep, 'Headcount/listSupers')
              .subscribe( res => {

                this.loading['sups'] = false

                this.dataSups = res.data

              }, err => {
                console.log("ERROR", err)

                this.loading['sups'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  chgDep( event ){
    this.dep = event
    this.getMetas( event )
    this.getSups( event )
  }

  chgSup( event ){
    this.sup = event
    this.getData(event)
  }

  getMetas( dep ){
    this.loading['metas'] = true

    this._api.restfulGet( dep, 'Cuartiles/dataMonitorMetas' )
            .subscribe( res => {

              this.loading['metas'] = false

              this.dataMetas = res.data

            }, err => {

              this.loading['metas'] = false

              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              }
            })
  }

  getData( sup ){

    this.loading['data'] = true
    this.timerFlag = false

    this._api.restfulGet( sup, 'Cuartiles/dataMonitorAsesores' )
            .subscribe( res => {

              this.loading['data'] = false

              let asesores = {}
              let keys = []

              for(let item of res.data){
                if( asesores[item.nombre] ){
                  asesores[item.nombre].push(item)
                }else{
                  asesores[item.nombre] = [item]
                  keys.push(item.nombre)
                }
              }

              this.numAsesores = keys.length
              this.dataAsesor = {}

              keys.sort()
              for(let k of keys){
                this.dataAsesor[k]=asesores[k]
              }

              this.timerFlag = true
              this.timeCount = 60

              this.timerLoad()


            }, err => {

              this.loading['data'] = false

              this.timerFlag = true
              this.timeCount = 10

              this.timerLoad()

              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              }
            })
  }

  chgMode( type ){
    this.screen = !type
  }

  timerLoad( pause = false ){

    if( this.timerFlag ){
      if( this.timeCount == 0 ){

        this.getMetas( this.dep )
        this.getData(  this.sup )

      }else{
        if( this.timeCount > 0){
          this.timeCount--
          this.timeout = setTimeout( () => {
          this.timerLoad()
          }, 1000 )
        }
      }
    }else{
      if( pause ){
        setTimeout( () => {
        this.timerLoad( true )
        }, 1000 )
      }
    }
  }

}

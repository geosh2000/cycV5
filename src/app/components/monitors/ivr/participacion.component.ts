import { Component, OnDestroy, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';

@Component({
  selector: 'app-participacion',
  templateUrl: './participacion.component.html',
  styles: []
})
export class ParticipacionComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'monitor_participacion_cc'
  timeout:any

  startDate:any
  dateSelected:any

  loading:Object = {}
  total:any
  monitor:boolean = true
  data:any
  date:any
  dids:any
  lu:any
  reload=false
  porCola:boolean=false
  soporte:boolean=false

  timerFlag:boolean= false
  timeCount:number= 300

  constructor(public _api: ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                private _zh:ZonaHorariaService,
                private completerService:CompleterService,
                public toastr: ToastrService ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    this.setToday()

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - IVR MP');
    this.getData()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  setToday(){
    this.dateSelected = moment().subtract(0,'days').format('YYYY-MM-DD')
    this.startDate = {
      year: parseInt(moment().subtract(0,'days').format('YYYY')),
      month: parseInt(moment().subtract(0,'days').format('MM')),
      day: parseInt(moment().subtract(0,'days').format('DD'))
    }
  }


  getData( event:boolean = false, td:boolean = true ){
    this.loading['data'] = true
    let flag = false

    if( td ){
      this.setToday()
      flag = true
    }

    let params = {
      date: this.dateSelected,
      porCola: false,
      soporte: false
    }

    if( event ){
      params['porCola'] = true
    }

    if( this.soporte ){
      params['soporte'] = true
    }

    this.timerFlag = false

    this._api.restfulPut( params, 'VentaMonitor/IvrPart')
              .subscribe( res => {

                this.loading['data'] = false

                this.reload = true

                this.data = res['data']['result']
                this.total = res['data']['total']
                this.dids = res['data']['dids']
                this.date = this.dateSelected
                this.lu = moment.tz(res['lu'], "America/Mexico_city").tz( this._zh.zone ).format('DD MMM YYYY HH:mm:ss')

                this.reload = false

                if( flag ){
                  this.timerFlag = true
                  this.timeCount = 300
                  this.timerLoad()
                }else{
                  this.timerFlag = false
                }

              }, err => {
                console.log("ERROR", err)

                this.timerFlag = true
                this.timeCount = 30
                this.timerLoad()

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  chgDate(){
    this.dateSelected = moment(`${this.startDate.year}-${this.startDate.month}-${this.startDate.day}`).format('YYYY-MM-DD')

    this.getData( this.porCola, false )

  }

  timerLoad( pause = false ){

    if( this.timerFlag ){
      if( this.timeCount == 0 ){

        this.getData()

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
        this.timeout = setTimeout( () => {
        this.timerLoad( true )
        }, 1000 )
      }
    }
  }

  refresh( event, tipo ){
    switch( tipo ){
      case 'cola':
        this.getData( event, this.monitor )
        break
      case 'live':
        this.getData( this.porCola, event )
        break
      case 'soporte':
        this.soporte = event
        this.getData( this.porCola, this.monitor )
        break
    }

  }

}

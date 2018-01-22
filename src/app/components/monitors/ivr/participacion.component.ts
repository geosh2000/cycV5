import { Component, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

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

  startDate:any
  dateSelected:any

  loading:Object = {}
  total:any
  monitor:boolean = true
  data:any
  date:any
  lu:any
  reload=false
  porCola:boolean=false

  timerFlag:boolean= false
  timeCount:number= 300

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                private completerService:CompleterService,
                public toastr: ToastsManager, vcr: ViewContainerRef ) {

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

    this.setToday()

  }

  setToday(){
    this.dateSelected = moment().subtract(0,'days').format('YYYY-MM-DD')
    this.startDate = {
      year: parseInt(moment().subtract(0,'days').format('YYYY')),
      month: parseInt(moment().subtract(0,'days').format('MM')),
      day: parseInt(moment().subtract(0,'days').format('DD'))
    }
  }

  ngOnInit() {
    this.getData()
  }

  getData( event:any = '', td:any = '' ){
    this.loading['data'] = true
    let flag = false

    if( td || (td == '' && this.monitor)){
      this.setToday()
      flag = true
    }

    let params = this.dateSelected

    if( event || (event == '' && this.porCola) ){
      params = `${params}/1`
    }

    this.timerFlag = false
    
    this._api.restfulGet( params, 'VentaMonitor/IvrPart')
              .subscribe( res => {

                this.loading['data'] = false

                this.reload = true

                this.data = res.data['result']
                this.total = res.data['total']
                this.date = this.dateSelected
                this.lu = moment.tz(res.lu, "America/Mexico_city").tz("America/Bogota").format('DD MMM YYYY HH:mm:ss')

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

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  chgDate(){
    this.dateSelected = moment(`${this.startDate.year}-${this.startDate.month}-${this.startDate.day}`).format('YYYY-MM-DD')

    this.getData()

  }

  timerLoad( pause = false ){

    if( this.timerFlag ){
      if( this.timeCount == 0 ){

        this.getData()

      }else{
        if( this.timeCount > 0){
          this.timeCount--
          setTimeout( () => {
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

  refresh( event ){
    this.getData( this.porCola, event )
  }

}

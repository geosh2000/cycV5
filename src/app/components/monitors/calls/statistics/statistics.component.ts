import { Component, OnInit, ViewContainerRef, ViewChild, Injectable } from '@angular/core';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService } from '../../../../services/api.service';
import { InitService } from '../../../../services/init.service';
import { TokenCheckService } from '../../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../../globals';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styles: []
})
export class StatisticsComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'monitor_participacion_cc'

  startDate:any
  dateSelected:any

  loading:Object = {}
  total:any
  monitor:boolean = true
  data:any
  locs:any
  dataH:Object = {}
  date:any
  dids:any
  lu:any
  luLocs:any
  reload=false

  skill:number = 35
  skills:any

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

    this.getSkills()

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
    setTimeout( () => { this.chgDate( true ) }, 1500 )

  }

  chgDep( skill ){
    this.skill = skill
    this.chgDate( this.monitor )
  }

  getSkills(){
    this._api.restfulGet( '', 'VentaMonitor/inDeps')
              .subscribe( res => {
                this.skills = {}
                for( let skill of res.data ){
                  this.skills[skill['skill']]= {Dep: skill['Departamento']}
                }

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }


  getData( td:boolean = true ){
    this.loading['data'] = true
    let flag = false

    if( td ){
      this.setToday()
      flag = true
    }

    let params = {
      date: this.dateSelected,
      skill: this.skill
    }

    this.timerFlag = false

    this._api.restfulPut( params, 'VentaMonitor/callStats')
              .subscribe( res => {

                this.loading['data'] = false

                this.reload = true

                let calls = []
                let groups = {}
                this.total = {
                  contestadas: 0,
                  abandonadas: 0,
                  IN: 0,
                  PDV: 0,
                  ofrecidas: 0
                }

                for( let call of res.data ){

                  this.total['ofrecidas'] += parseInt(call['calls'])

                  if( call['Grupo'] == 'Abandon'){
                    this.total['abandonadas'] += parseInt(call['calls'])
                  }else{
                    this.total['contestadas'] += parseInt(call['calls'])
                    switch(call['Grupo']){
                      case 'IN':
                        this.total['IN'] += parseInt(call['calls'])
                        break
                      case 'PDV':
                        this.total['PDV'] += parseInt(call['calls'])
                        break
                    }
                  }

                  if( !groups[call['Grupo']] ){
                    groups[call['Grupo']] = {
                      name: call['Grupo'],
                      data: [[parseInt(this.unixTime(call['H'])), parseInt(call['calls'])]]
                    }


                  }else{
                    groups[call['Grupo']]['data'].push([parseInt(this.unixTime(call['H'])), parseInt(call['calls'])])
                  }
                }

                this.data = { Abandon : { name  : 'Abandon',
                                          color : '#870000',
                                          data  : groups['Abandon'] ? groups['Abandon']['data'] : []
                                        },
                              PDV     : { name  : 'PDV',
                                          color : '#008bd1',
                                          data  : groups['PDV'] ? groups['PDV']['data'] : []
                                        },
                              IN      : { name  : 'IN',
                                          color : '#0f7500',
                                          data  : groups['IN'] ? groups['IN']['data'] : []
                                        }
                              }


                this.date = this.dateSelected
                // this.lu = moment.tz(res.lu, "America/Mexico_city").tz("America/Bogota").format('DD MMM YYYY HH:mm:ss')

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

  getPast( date, group ){
    this.loading['data'] = true

    let params = {
      date: date,
      skill: this.skill
    }

    this._api.restfulPut( params, 'VentaMonitor/callStatsH')
              .subscribe( res => {

                this.loading['data'] = false

                this.dataH[group] = {
                  name: group,
                  // color: color,
                  data: [],
                  type: 'line'
                }

                let d

                switch( group ){
                  case 'ly':
                    d = 364
                    break
                  case 'lw':
                    d = 7
                    break
                }

                for( let h of res.data ){
                  this.dataH[group]['data'].push([parseInt(this.unixTime(moment(h['H']).add(d, 'days').format('YYYY-MM-DD HH:mm:ss'))), parseInt(h['calls'])])
                }

                if( group == 'ly' ){
                  this.getPast( moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD'), 'lw' )
                }

                if( group == 'lw' ){
                  this.getData( this.monitor )
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

  chgDate( flag = false ){
    this.dateSelected = moment(`${this.startDate.year}-${this.startDate.month}-${this.startDate.day}`).format('YYYY-MM-DD')
    if( flag ){
      this.dateSelected = moment().format('YYYY-MM-DD')
      this.getPast( moment().subtract(364, 'days').format('YYYY-MM-DD'), 'ly' )
    }else{
      this.getPast( moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'ly' )
    }
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

  refresh( event, tipo ){
    switch( tipo ){
      case 'live':
        this.dateSelected = moment().format('YYYY-MM-DD')
        this.chgDate( event )
        break
    }

  }

  unixTime( time ){
    // DEFINE UNIX TIME
    let m = moment.tz(`${ time }`, "America/Mexico_city")
    let local = m.clone().tz("America/Bogota")
    let dif = moment(m.format('YYYY-MM-DD HH:mm:ss')).diff(local.format('YYYY-MM-DD HH:mm:ss'), 'hours')
    m.subtract((5+(dif*(-1))), 'hours')
    return m.format('x')
  }

}

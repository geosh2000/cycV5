import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';
declare var jQuery:any;
declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pdv-monitor-horarios',
  templateUrl: './pdv-monitor-horarios.component.html',
  styles: []
})
export class PdvMonitorHorariosComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'sch'

  loading:Object = {}
  data:Object = {}
  detailShown:any = []

  months:any = [1,2,3,4,5,6,7,8,9,10,11,12]
  years:any = []

  monthSelected:any
  yearSelected:any

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                private _init:InitService,
                private titleService:Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService,
                ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
      .subscribe( res => {

        if( res.status ){
          this.showContents = this._init.checkCredential( this.mainCredential, true )
        }else{
          this.showContents = false
        }
      })

      moment.locale('es-MX')

      let y = parseInt(moment().format('YYYY'))
      let m = parseInt(moment().format('MM'))

      this.monthSelected = m
      this.yearSelected = y

      for( let i = y-1; i<=y+1; i++ ){
        this.years.push(i)
      }

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Check PDV Horarios');
    // this.getData()
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.yearSelected}-${this.monthSelected}-01`, 'Monitoring/horariosPdv' )
            .subscribe( res => {

              this.loading['data'] = false

              this.data['byCoord'] = res['data']['byCoord']

              let sups:Object = {}
              for( let sup of res['data']['bySuper'] ){
                sup['pdvs'] = []
                sups[sup['s_id']]= sup
              }

              let pdvs:Object = {}
              for( let p of res['data']['byPdv'] ){
                p['dates'] = []
                pdvs[p['pdvId']]= p
              }
              for( let dt of res['data']['detalle'] ){
                let asesores = []
                let asesoresD = []
                if( dt['asesores'] ){
                  asesores = dt['asesores'].split(',')
                }
                if( dt['asesoresDescanso'] ){
                  asesoresD = dt['asesoresDescanso'].split(',')
                }
                dt['asesoresList'] = asesores
                dt['asesoresDList'] = asesoresD
                pdvs[dt['pdvIdVac']]['dates'].push(dt)
              }

              // tslint:disable-next-line:forin
              for( let sid in pdvs ){
                sups[pdvs[sid]['s_id']]['pdvs'].push(pdvs[sid])
              }

              // tslint:disable-next-line:forin
              for( let cid in sups ){
                let i = this.getIndex(this.data['byCoord'], 'c_id', sups[cid]['c_id'])
                if(this.data['byCoord'][i]['sups']){
                  this.data['byCoord'][i]['sups'].push(sups[cid])
                }else{
                  this.data['byCoord'][i]['sups'] = [sups[cid]]
                }
              }

              console.log(this.data)

            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  getIndex(arr, field, val){
    let x = 0
    for( let i of arr ){
      if( i[field] == val ){
        return x
      }
      x++
    }

    return -1
  }

  openDetail(arr){
    this.detailShown = arr
    jQuery('#detailPdv').modal('show')
  }

}

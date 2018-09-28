import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, ZonaHorariaService } from '../../../services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-rn',
  templateUrl: './rn.component.html',
  styles: []
})
export class RnComponent implements OnInit {

  daily:any = {}
  total:any

  today:any
  selectedCountry:string = 'MX'
  timer:number = 300
  lu:string

  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  currentUser:any

  loading:boolean = false

  params:Object = {}

  constructor(
              private _api:ApiService,
              public _init:InitService,
              public _zh:ZonaHorariaService,
              public toastr: ToastrService ) {

      this.currentUser = this._init.getUserInfo()
      this.showContents = this._init.checkCredential( this.mainCredential, true )

      this.params = {
        start:  `${moment().format('YYYY-MM')}-01`,
        // start:  `2017-11-01`,
        end:    moment().format('YYYY-MM-DD'),
        pais:   this.selectedCountry,
        marca:  'Marcas Propias'
      }

      this.today = moment().format("YYYY-MM-DD")

      this.getData()
      this.runTimer()
  }

  ngOnInit() {
  }

  getData(){
    this.loading = true

    this._api.restfulPost( this.params, 'Venta/getRN' )
            .subscribe( res => {

              console.log(res['data'])

              this.daily = this.processData( res['data'].dates,'daily' )
              this.total = this.processData( res['data'].all,'total' )

              let lu = moment.tz(res['data'].lu.LU, "America/Mexico_city")
              let luCUN = lu.clone().tz( this._zh.zone )

              this.lu = luCUN.format("DD MMM 'YY kk:mm:ss")

              this.loading = false

              this.timer = 300

            }, err => {
              if(err){
                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)
                this.loading = false
                this.timer = 30
              }
            })
  }

  processData( data, tipo ){
    let result = {}

    for(let row of data){

      if( tipo == 'daily' ){
        if(!result[row['Fecha']]){
          result[row['Fecha']] = {}
        }

        if(!result[row['Fecha']][row.gpoCanalKpi]){
          result[row['Fecha']][row.gpoCanalKpi] = {}
        }

        if(!result[row['Fecha']][row.gpoCanalKpi][row.tipoCanal]){
          result[row['Fecha']][row.gpoCanalKpi][row.tipoCanal] = {}
        }

        result[row['Fecha']][row.gpoCanalKpi][row.tipoCanal]['RN_w_xld']  = row.RN_w_xld
        result[row['Fecha']][row.gpoCanalKpi][row.tipoCanal]['RN']        = row.RN
      }else{
        if(!result[row.gpoCanalKpi]){
          result[row.gpoCanalKpi] = {}
        }

        if(!result[row.gpoCanalKpi][row.tipoCanal]){
          result[row.gpoCanalKpi][row.tipoCanal] = {}
        }

        result[row.gpoCanalKpi][row.tipoCanal]['RN_w_xld']  = row.RN_w_xld
        result[row.gpoCanalKpi][row.tipoCanal]['RN']        = row.RN
      }

    }

    return result
  }

  getTotal( canal, tipo, metrica ){
    let data

    if( tipo == 'daily' ){
      data = this.daily[this.today]
    }else{
      data = this.total
    }

    let result = 0

    for(let item in data){
      if( item == canal ){
        for( let met in data[item] ){
          result += parseInt(data[item][met][metrica])
        }
      }
    }

    return result
  }

  printMoment( data, format ){
    let info = moment.tz( data, 'America/Mexico_city' )
    let cun = info.clone().tz( this._zh.zone )

    return cun.format(format)
  }

  chgCountry(){
    if(this.selectedCountry == 'MX'){
      this.selectedCountry = 'CO'
      this.params['pais'] = 'CO'
    }else{
      this.selectedCountry = 'MX'
      this.params['pais'] = 'MX'
    }

    setTimeout( () => this.getData(), 500 )
  }

  runTimer(){
    let time = this.timer - 1

    if( time == 0 ){
      this.getData()
    }

    if( time > 0 ){
      this.timer = time
    }

    setTimeout( () => this.runTimer(), 1000 )
  }

}

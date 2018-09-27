import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-bonos',
  templateUrl: './bonos.component.html',
  styles: []
})
export class BonosComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'tablas_f'

  loading:Object = {}

  months:any = [1,2,3,4,5,6,7,8,9,10,11,12]
  years:any

  viewParams:Object = {
    year: moment().format('YYYY'),
    month: parseInt(moment().format('MM'))-1
  }

  bonosData:any
  detalleData:any
  paramsData:any
  metasData:any
  depsData:any

  paramsDataAsk:any
  reload:Object = {}

  total:Object = {}

  parList = [1,2,3,4]

  constructor(
                private _api:ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService
                ) {
    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
          }
        })

    this.years = [parseInt(moment().format('YYYY'))-1, parseInt(moment().format('YYYY'))]

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Incentivos');
  }

  getBonos(){
    this.loading['bonos'] = true

    this._api.restfulGet( `${this.viewParams['month']}/${this.viewParams['year']}`, 'Bonos/buildBonos' )
            .subscribe( res => {

              this.loading['bonos'] = false
              this.bonosData = res['data']['resultado']
              this.detalleData = res['data']['detalle']
              this.paramsData = res['params']['params']
              this.metasData = res['params']['metas']
              this.depsData = res['params']['deps']
              this.paramsDataAsk = res['params']['searchedParams']

              this.sumAll(res['data']['resultado'])

              console.log(res)
            }, err => {
              console.log("ERROR", err)

              this.loading['bonos'] = false

              let error = err.error
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  matchPar(item, pat ){
    switch(pat){
      case 'par':
        return item.match(/par/gm)
      case 'red':
        return item.match(/red/gm)
      case 'asesor':
        return item.match(/^\d*$/gm)
    }
  }

  sumBono( dep, puesto, asesor, tipo ){
    let result = 0
    let monto = 0, red = 0

    if(this.bonosData[dep][puesto][asesor]['aplica'] == 0){
      return 0
    }

    for( let item in this.bonosData[dep][puesto][asesor]['bono'] ){
      monto += this.bonosData[dep][puesto][asesor]['bono'][item]
    }

    for( let item in this.bonosData[dep][puesto][asesor]['reductores'] ){
      red += this.bonosData[dep][puesto][asesor]['reductores'][item]
    }

    red = red < (-1) ? -1 : red

    switch(tipo){
      case 'bono':
        return monto
      case 'red':
        return monto*red
      case 'total':
        return monto + (monto*red)
    }

  }

  sumAll( data ){
    this.total = {}

    for( let dep in data ){
      this.total[dep] = {}
      if( this.paramsData[dep] ){
        for( let puesto in data[dep] ){
          this.total[dep][puesto] = 0
          if( this.paramsData[dep][puesto] ){

            for( let asesor in data[dep][puesto] ){

              if( typeof data[dep][puesto][asesor] == 'object' ){
                if(this.bonosData[dep][puesto][asesor]['aplica'] != 0 && parseInt(this.bonosData[dep][puesto][asesor]['aprobacion']['status']) == 1){


                  let monto = 0, red = 0

                  for( let item in this.bonosData[dep][puesto][asesor]['bono'] ){
                    monto += this.bonosData[dep][puesto][asesor]['bono'][item]
                  }

                  for( let item in this.bonosData[dep][puesto][asesor]['reductores'] ){
                    red += this.bonosData[dep][puesto][asesor]['reductores'][item]
                  }

                  red = red < (-1) ? -1 : red

                  let tot = monto + (monto*red)

                  if( this.total[dep] ){
                    if( this.total[dep][puesto] ){
                        this.total[dep][puesto] += tot
                    }else{
                        this.total[dep][puesto] = tot
                    }
                  }else{
                      this.total[dep] = { [puesto]: tot }
                  }

                }
              }
            }
          }
        }
      }
    }

  }

  percMatch( item ){
    let flag = false

    if( item.match(/^c_/gm) ){
      flag = true
    }

    switch(item){
      case 'pec':
      case 'fcr':
      case 'sla':
        flag = true
    }

    return flag
  }

  titleize(title){
    return title.replace(/^c_/gm, 'Cumplimiento ' ).replace(/_/gm, ' ')
  }

  paySave( event, dep, puesto ){
    if( event['status'] ){
      this.toastr.success( event['msg'], 'Guardado' )
      this.bonosData[dep][puesto][event['chg']['asesor']]['aprobacion']['status'] = parseInt(event['chg']['status'])
      if( event['chg']['review'] ){
        this.bonosData[dep][puesto][event['chg']['asesor']]['aprobacion']['review'] = parseInt(event['chg']['review'])
      }

      for( let par in event['meta'] ){
        this.bonosData[dep][puesto][event['chg']['asesor']]['aprobacion'][par]=event['meta'][par]
      }
      this.sumAll( this.bonosData )
    }else{
      if( event['saved'] ){
        this.toastr.error( event['msg'], 'Error' )
      }else{
        this.toastr.warning(event['msg'], 'Alerta!');
        for( let par in event['meta'] ){
          this.bonosData[dep][puesto][event['chg']['asesor']]['aprobacion'][par]=event['meta'][par]
        }
      }
    }

    setInterval( () => {
      this.reload[event['asesor']]=moment()
    },2000)

  }
}

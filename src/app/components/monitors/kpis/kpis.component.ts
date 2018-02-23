import { Component, OnInit, ViewContainerRef } from '@angular/core';
import * as moment from 'moment-timezone';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';
declare var jQuery:any;

@Component({
  selector: 'app-kpis',
  templateUrl: './kpis.component.html',
  styles: []
})
export class KpisComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'tablas_f'

  ventaData:any

  loading:Object = {}
  fechas:any = ['td', 'yd', 'ly']
  gpos:any = ['Total', 'Online', 'CC-In', 'CC-Out', 'PDV']
  lu:any

  params:Object = {
    montoSV   : 'MontoSV',
    marca     : 'Marcas Propias',
    pais      : 'MX'
  }

  colors:any = ['#7cb8e2', '#e28cd4', '#b99d68', '#ace4e4']
  services:any = ['Hotel', 'Paquete', 'Vuelo']

  dateSelected:any
  hourSelected:any = moment().tz('America/Mexico_city').format('HH:mm:ss')

  timeToReload:any  = 300
  timerCount:any    = this.timeToReload

  startDate:any
  monitor:boolean = true
  detail:boolean  = true
  detailView:Object = {
    fc        : true,
    producto  : true,
    locs      : true
  }

  glosario:any = [
    {concept: 'var', exp: 'Variación'},
    {concept: 'yd', exp: '-1 día'},
    {concept: 'ly', exp: '-1 año (mismo día de la semana)'},
    {concept: 'RN', exp: 'RoomNights'},
    {concept: 'ML', exp: 'MasterLocator'},
    {concept: 'FC', exp: 'Factor de Conversión'},
    {concept: 'Av Tkt', exp: 'Ticket Promedio'}
  ]

  constructor(public _api: ApiService,
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

  refresh( event ){
    if( event ){
      this.chgDate( true )
    }
  }

  chgDate( flag = false ){
    this.dateSelected = moment(`${this.startDate.year}-${this.startDate.month}-${this.startDate.day}`).format('YYYY-MM-DD')
    if( flag ){
      this.dateSelected = moment().format('YYYY-MM-DD')
    }

    this.getData()
  }

  ngOnInit() {
    this.getData()
    this.timerLoad()
  }

  getData(){
    this.loading['venta'] = true
    let params = {
      Fecha : this.dateSelected,
      Hora  : moment().tz('America/Mexico_city').format('HH:mm:ss'),
      pais  : this.params['pais'],
      marca : this.params['marca'],
    }

    if( this.dateSelected != moment().format('YYYY-MM-DD') ){
      params['h'] = 1
    }else{
      params['h'] = 0
    }

    this._api.restfulPut( params,'Venta/kpis' )
            .subscribe( res => {

              this.loading['venta'] = false
              this.lu = moment.tz(res.lu, 'America/Mexico_city').tz('America/Bogota').format('DD MMM \'YY HH:mm:ss')

              let fechas = {
                [this.dateSelected] : 'td',
                [moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD')] : 'yd',
                [moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD')] : 'ly'
              }
              let data = {}
              let x=0

              for(let gpo of res.data['locs']){

                let gpoName = gpo['gpoTipoRsvaOk'] == 'Presencial' ? 'PDV' : gpo['gpoTipoRsvaOk']
                gpoName = gpoName == 'In' ? 'CC-In' : gpoName
                gpoName = gpoName == 'Out' ? 'CC-Out' : gpoName

                if( data[gpo['gpoCanalKpi']] ){
                  if( data[gpo['gpoCanalKpi']][gpoName] ){
                    data[gpo['gpoCanalKpi']][gpoName][fechas[gpo['Fecha']]] = gpo
                  }else{
                    data[gpo['gpoCanalKpi']][gpoName] = {
                      [fechas[gpo['Fecha']]] : gpo
                    }
                  }
                }else{
                  data[gpo['gpoCanalKpi']] = {
                    [gpoName]: {
                      [fechas[gpo['Fecha']]]: gpo
                    },
                    color: this.colors[x]
                  }
                  x++
                }

                // if( data[gpo['gpoCanalKpi']]['Total'] ){
                //
                // }else{
                //   data[gpo['gpoCanalKpi']]['Total'] = {
                //     [fechas[gpo['Fecha']]] : gpo
                //   }
                // }
              }

              for( let gpo of res.data['servicios'] ){
                let gpoName = gpo['gpoTipoRsvaOk'] == 'Presencial' ? 'PDV' : gpo['gpoTipoRsvaOk']
                gpoName = gpoName == 'In' ? 'CC-In' : gpoName
                gpoName = gpoName == 'Out' ? 'CC-Out' : gpoName

                if( data[gpo['gpoCanalKpi']] ){
                  if( data[gpo['gpoCanalKpi']][gpoName] && data[gpo['gpoCanalKpi']][gpoName][fechas[gpo['Fecha']]] ){
                    if( data[gpo['gpoCanalKpi']][gpoName][fechas[gpo['Fecha']]] ){
                      data[gpo['gpoCanalKpi']][gpoName][fechas[gpo['Fecha']]][gpo['servicio']] = gpo
                    }else{
                      data[gpo['gpoCanalKpi']][gpoName][fechas[gpo['Fecha']]] = {
                        [gpo['servicio']]: gpo
                      }
                    }
                  }
                }else{
                  data[gpo['gpoCanalKpi']] = {
                    [gpoName]: {
                      [fechas[gpo['Fecha']]]: {
                        [gpo['servicio']]: gpo
                      }
                    },
                    color: this.colors[x]
                  }
                  x++
                }
              }

              this.ventaData = data
              console.log(this.ventaData)
              this.processCalls()

            }, err => {
              console.log("ERROR", err)

              this.loading['venta'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })

  }

  processCalls(){
    switch( this.params['pais'] ){
      case 'MX':
        switch( this.params['marca'] ){
          case 'Marcas Propias':
            this.getCalls( 35, this.dateSelected, 'PT.com', () => {
              this.getCalls( 35, moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD'), 'PT.com', () => {
                this.getCalls( 35, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'PT.com' )
              } )
            } )
            break
          case 'Marcas Terceros':
            this.getCalls( 3, this.dateSelected, 'Afiliados', () => {
              this.getCalls( 3, moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                this.getCalls( 3, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                  this.getCalls( 3, this.dateSelected, 'Intertours', () => {
                    this.getCalls( 3, moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD'), 'Intertours', () => {
                      this.getCalls( 3, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'Intertours' )
                    } )
                  } )
                } )
              } )
            } )
            break
        }
        break
    }
  }

  callsCheck(canal, group){
    if( canal == 'PT.com' ){
      if( group == 'PDV' || group == 'CC-In' ){
        return true
      }
    }

    if( canal == 'Afiliados' ){
      if( group == 'CC-In' ){
        return true
      }
    }

    if( canal == 'Intertours' ){
      if( group == 'CC-In' ){
        return true
      }
    }

    return false

  }

  getCalls( skill, date, canal, callback? ){

    if( skill == '' ){
      return false
    }

    this.loading['calls'] = true

    let params = {
      Fecha : date,
      Hora  : moment().tz('America/Mexico_city').format('HH:mm:ss'),
      skill : skill,
      canal : canal
    }

    if( this.dateSelected != moment().format('YYYY-MM-DD') ){
      params['h'] = 1
    }else{
      params['h'] = 0
    }

    this._api.restfulPut( params,'VentaMonitor/callsKpis' )
            .subscribe( res => {

              this.loading['calls'] = false

              let fechas = {
                [this.dateSelected] : 'td',
                [moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD')] : 'yd',
                [moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD')] : 'ly'
              }
              let data = {}

              for(let gpo of res.data){

                let gpoName = 'CC-In'

                if( this.ventaData[canal] ){
                  if( this.ventaData[canal][gpoName] ){
                    if( this.ventaData[canal][gpoName][fechas[date]] ){
                      this.ventaData[canal][gpoName][fechas[date]]['callsTotal'] = parseInt(gpo['Ans']) + parseInt(gpo['Abn'])
                      this.ventaData[canal][gpoName][fechas[date]]['calls'] = parseInt(gpo['Ans'])
                    }
                  }
                }

              }

              console.log(this.ventaData)

              if( callback ){ callback() }

            }, err => {
              console.log("ERROR", err)

              this.loading['calls'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })

  }

  compare( canal, group, concept, dateA, dateB, tipo, service = '' ){

    let a, b

    if( group == 'Total' ){
      a = this.getTotal(canal, dateA, concept, service)
    }else{

      if( !this.ventaData[canal][group] ){
        switch(tipo){
          case '%':
            return 0
          case 'class':
            return 'badge-info'
        }
      }

      if( service == '' ){
        a = this.ventaData[canal][group][dateA] ? ( this.ventaData[canal][group][dateA][concept] ? this.ventaData[canal][group][dateA][concept] : 0 ) : 0
      }else{
        if( this.ventaData[canal][group][dateA] && this.ventaData[canal][group][dateA][service] ){
          a = this.ventaData[canal][group][dateA][service][concept] ? this.ventaData[canal][group][dateA][service][concept] : 0
        }else{
          a = 0
        }
      }

    }

    if( a == 0 ){
      switch(tipo){
        case '%':
          return 0
        case 'class':
          return 'badge-info'
      }
    }

    if( group == 'Total' ){
      b = this.getTotal(canal, dateB, concept, service)
    }else{

      if( service == '' ){
        b = this.ventaData[canal][group][dateB] ? ( this.ventaData[canal][group][dateB][concept] ? this.ventaData[canal][group][dateB][concept] : 0 ) : 0
      }else{
        if( this.ventaData[canal][group][dateB] && this.ventaData[canal][group][dateB][service] ){
          b = this.ventaData[canal][group][dateB][service][concept] ? this.ventaData[canal][group][dateB][service][concept] : 0
        }else{
          b = 0
        }
      }

    }

    if( b == 0 ){
      switch(tipo){
        case '%':
          return 100
        case 'class':
          return 'badge-info'
      }
    }

    let result = (a / b * 100) - 100

    switch(tipo){
      case '%':
        return result
      case 'class':
        if( result < -5 ){
          return 'badge-danger'
        }else{
          if( result < 5 ){
            return 'badge-info'
          }else{
            return 'badge-success'
          }
        }
    }

  }

  getTotal( canal, date, concept, servicio = ''){
    let r = 0
    let source

    for(let gpo in this.ventaData[canal] ){
      if( this.ventaData[canal][gpo][date] ){

        source = ''

        if( servicio == '' ){
          source = this.ventaData[canal][gpo][date]
        }else{
          if( this.ventaData[canal][gpo][date][servicio] ){
            source = this.ventaData[canal][gpo][date][servicio]
          }
        }

        if( source != '' ){
          r += parseFloat(source[concept])
        }
      }
    }

    return r
  }

  getVal( canal, group, concept, date, service = '' ){

    let a

    if( group == 'Total' ){
      a = this.getTotal(canal, date, concept, service)
    }else{

      if( !this.ventaData[canal][group] ){
        return 0
      }

      if( service == '' ){
        a = this.ventaData[canal][group][date] ? ( this.ventaData[canal][group][date][concept] ? this.ventaData[canal][group][date][concept] : 0 ) : 0
      }else{
        if( this.ventaData[canal][group][date] && this.ventaData[canal][group][date][service] ){
          a = this.ventaData[canal][group][date][service][concept] ? this.ventaData[canal][group][date][service][concept] : 0
        }else{
          a = 0
        }
      }

    }

    return a

  }

  chgSV( monto ){
    this.params['montoSV'] = monto
  }

  chgMarca( marca ){
    this.params['marca'] = marca
  }

  chgPais( pais ){
    this.params['pais'] = pais
  }

  timerLoad(){
    if( this.timerCount == 0 ){
      this.getData()
      this.timerCount = this.timeToReload
    }else{
      this.timerCount--
    }

    setTimeout( () => this.timerLoad(), 1000 )

  }

}
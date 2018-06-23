import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment-timezone';

import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
declare var jQuery:any;

@Component({
  selector: 'app-kpis',
  templateUrl: './kpis.component.html',
  styles: []
})
export class KpisComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'
  timeout:any

  ventaData:any

  loading:Object = {}
  fechas:any = ['td', 'yd', 'ly']
  gpos:any = ['Total', 'Online', 'CC-In', 'CC-Out', 'PDV']
  lu:any

  params:Object = {
    compare   : 'yd',
    montoSV   : 'MontoSV',
    marca     : 'Marcas Propias',
    pais      : 'MX'
  }

  suf:string  = ''

  colors:any = ['#7cb8e2', '#e28cd4', '#b99d68', '#ace4e4']
  services:any = ['Hotel', 'Paquete', 'Vuelo']

  dateSelected:any
  hourSelected:any = moment().tz('America/Mexico_city').format('HH:mm:ss')

  timeToReload:any  = 300
  timerCount:any    = this.timeToReload

  startDate:any
  yd:boolean = true
  monitor:boolean = true
  detail:boolean  = true
  detailView:Object = {
    fc        : true,
    producto  : true,
    paq       : false,
    locs      : true
  }

  glosario:any = [
    {concept: 'var', exp: 'Variación'},
    {concept: 'yd', exp: '-1 día'},
    {concept: 'lw', exp: '-7 días (mismo día de la semana)'},
    {concept: 'ly', exp: '-1 año (mismo día de la semana)'},
    {concept: 'RN', exp: 'RoomNights'},
    {concept: 'ML', exp: 'MasterLocator'},
    {concept: 'FC', exp: 'Factor de Conversión'},
    {concept: 'Av Tkt', exp: 'Ticket Promedio'}
  ]

  constructor(public _api: ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
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
    this.titleService.setTitle('CyC - KPIs Live!')
    this.getData()
    this.timerLoad()
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getData( paq = this.detailView['paq'] ){
    this.loading['venta'] = true
    let params = {
      Fecha : this.dateSelected,
      Hora  : moment().tz('America/Mexico_city').format('HH:mm:ss'),
      pais  : this.params['pais'],
      marca : this.params['marca'],
      paq   : paq ? 1 : 0
    }

    if( this.dateSelected != moment().format('YYYY-MM-DD') ){
      params['h'] = 1
    }else{
      params['h'] = 0
    }

    this._api.restfulPut( params,'Venta/kpis' )
            .subscribe( res => {

              this.loading['venta'] = false
              this.lu = moment.tz(res['lu'], 'America/Mexico_city').tz('America/Bogota').format('DD MMM \'YY HH:mm:ss')

              let fechas = {
                [this.dateSelected] : 'td',
                [moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD')] : 'yd',
                [moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD')] : 'lw',
                [moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD')] : 'ly'
              }
              let data = {}
              let x=0

              for(let gpo of res['data']['locs']){

                let gpoName = gpo['gpoTipoRsvaOk'] == 'Presencial' ? 'PDV' : gpo['gpoTipoRsvaOk']
                gpoName = gpoName == 'In' ? 'CC-In' : gpoName
                gpoName = gpoName == 'Out' ? 'CC-Out' : gpoName

                if( data[gpo['gpoCanalKpiOK']] ){
                  if( data[gpo['gpoCanalKpiOK']][gpoName] ){
                    data[gpo['gpoCanalKpiOK']][gpoName][fechas[gpo['Fecha']]] = gpo
                  }else{
                    data[gpo['gpoCanalKpiOK']][gpoName] = {
                      [fechas[gpo['Fecha']]] : gpo
                    }
                  }
                }else{
                  data[gpo['gpoCanalKpiOK']] = {
                    [gpoName]: {
                      [fechas[gpo['Fecha']]]: gpo
                    },
                    color: this.colors[x]
                  }
                  x++
                }

                // if( data[gpo['gpoCanalKpiOK']]['Total'] ){
                //
                // }else{
                //   data[gpo['gpoCanalKpiOK']]['Total'] = {
                //     [fechas[gpo['Fecha']]] : gpo
                //   }
                // }
              }

              for( let gpo of res['data']['servicios'] ){
                let gpoName = gpo['gpoTipoRsvaOk'] == 'Presencial' ? 'PDV' : gpo['gpoTipoRsvaOk']
                gpoName = gpoName == 'In' ? 'CC-In' : gpoName
                gpoName = gpoName == 'Out' ? 'CC-Out' : gpoName

                if( data[gpo['gpoCanalKpiOK']] ){
                  if( data[gpo['gpoCanalKpiOK']][gpoName] && data[gpo['gpoCanalKpiOK']][gpoName][fechas[gpo['Fecha']]] ){
                    if( data[gpo['gpoCanalKpiOK']][gpoName][fechas[gpo['Fecha']]] ){
                      data[gpo['gpoCanalKpiOK']][gpoName][fechas[gpo['Fecha']]][gpo['servicio']] = gpo
                    }else{
                      data[gpo['gpoCanalKpiOK']][gpoName][fechas[gpo['Fecha']]] = {
                        [gpo['servicio']]: gpo
                      }
                    }
                  }
                }else{
                  data[gpo['gpoCanalKpiOK']] = {
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
                this.getCalls( 35, moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD'), 'PT.com', () => {
                  this.getCalls( 35, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'PT.com' )
                } )
              } )
            } )
            break
          case 'Marcas Terceros':
            this.getCalls( 3, this.dateSelected, 'Afiliados', () => {
              this.getCalls( 3, moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                this.getCalls( 3, moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                  this.getCalls( 3, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'Afiliados' )
                } )
              } )
            } )
            break
        }
        break
      case 'CO':
        switch( this.params['marca'] ){
          case 'Marcas Terceros':
            this.getCalls( 3, this.dateSelected, 'Afiliados', () => {
              this.getCalls( 3, moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                this.getCalls( 3, moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                  this.getCalls( 3, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'Afiliados', () => {
                    this.getCalls( 3, this.dateSelected, 'Intertours', () => {
                      this.getCalls( 3, moment(this.dateSelected).subtract(1, 'days').format('YYYY-MM-DD'), 'Intertours', () => {
                        this.getCalls( 3, moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD'), 'Intertours', () => {
                          this.getCalls( 3, moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD'), 'Intertours' )
                        } )
                      } )
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
                [moment(this.dateSelected).subtract(7, 'days').format('YYYY-MM-DD')] : 'lw',
                [moment(this.dateSelected).subtract(364, 'days').format('YYYY-MM-DD')] : 'ly'
              }
              let data = {}

              for(let gpo of res['data']){

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

  chgCompare( event ){
    if( event ){
      this.params['compare'] = 'yd'
    }else{
      this.params['compare'] = 'lw'
    }

  }

  chgPais( pais ){
    this.params['pais'] = pais
  }

  chgPaq( event ){
    this.getData( event )
  }

  timerLoad(){
    if( this.timerCount == 0 ){
      this.refresh( this.monitor )
      this.timerCount = this.timeToReload
    }else{
      this.timerCount--
    }

    this.timeout = setTimeout( () => this.timerLoad(), 1000 )

  }

  currencyDispl( ammount ){
    if( this.params['marca'] == 'Marcas Propias' && this.params['pais'] == 'CO'){

      let monto = ammount * 146.741
      this.suf = ''
      if( monto > 1000000 ){
        monto = monto / 1000
        this.suf = 'K'
      }

      return monto

    }else{
      this.suf = ''
      return ammount
    }
  }

}

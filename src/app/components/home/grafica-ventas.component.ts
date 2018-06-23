import { Component, OnInit, ViewContainerRef, Input, SimpleChanges } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-grafica-ventas',
  templateUrl: './grafica-ventas.component.html',
  styles: []
})
export class GraficaVentasComponent implements OnInit {

  @Input() asesor:any = ''
  @Input() name:any = ''

  chart: Object = {}
  options: Object

  LU:string
  loading:boolean = false

  activeTab:string      = 'montos'
  secReload:number
  timeForReload:number  = 300

  constructor(public _api: ApiService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService ) {

    this.options = {
                    chart:{
                      width: 1000
                    },
                    title: {
                        text: 'Cargando...',
                    },
                    subtitle: {
                      text: 'cargando...',
                    },
                    xAxis: {
                        tickPixelInterval: 150,
                        title: {
                            text: 'Fecha'
                        }
                    },
                    yAxis: [{

                        min:0,
                        tickInterval: null,
                        title: {
                            text: 'Monto Acumulado ($)'
                        },
                        plotLines: [{
                            dashStyle:'ShortDot',
                            width: 4,
                            color: '#6BCC3D',
                            value: 2000000,
                            label:{
                                text: 'Meta del Mes',
                                style: {
                                    color: '#606060'
                                }
                            },
                            zIndex:1
                        }]
                    },{
                        title: {
                            text: 'Monto Diario ($)'
                        },
                        min: 0,
                        opposite: true,
                        plotLines: [{
                            dashStyle:'ShortDot',
                            width: 4,
                            color: '#42b0f4',
                            value: 100000,
                            label:{
                                text: 'Meta Diaria',
                                style: {
                                    color: '#606060'
                                }
                            },
                            zIndex:1
                        }]
                    }],
                    tooltip: {
                        valueSuffix: ''
                    },
                    plotOptions: {
                      series: {
                          borderWidth: 1,
                          borderColor: 'black'
                      },
                      column: {
                        stacking: 'normal'
                      }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    series: [
                      { data: [0] },
                      { data: [0] }
                    ]
                  };


  }

  ngOnInit() {
    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData( false, this.activeTab )
  }

  getData( loop = true, id = '' ){

    this.loading = true

    if( !loop ){
      this.activeTab = id
    }

    this._api.restfulGet( this.asesor, 'VentaMonitor/getVentaAsesorGraph' )
            .subscribe( res => {

              this.loading = false

              let dataCat   = this.generateDates()
              let dataObj   = {}

              for(let item of res['data']){
                dataObj[item.fecha] = {}

                for( let index in item ){
                  dataObj[item.fecha][index] = item[index]

                  this.LU = moment.tz( item.Last_update, 'America/Mexico_City' ).tz('America/Bogota').format("kk:mm:ss DD MMM 'YY")
                }

              }

              //Montos
              this.setMontos( dataObj, dataCat, id )

              //FC
              this.setFC( dataObj, dataCat, id )

              if(loop){
                this.secReload = this.timeForReload
                this.timer()
              }

            }, err => {

              this.loading = false

              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

                if(loop){
                  this.secReload = this.timeForReload
                  this.timer()
                }

              }
            })
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
  }

  generateDates(){
    let td = moment( moment().format('YYYY-MM-DD') )
    let first = moment( `${td.format('YYYY-MM')}-01` )
    let last = first.clone().add(1, 'months').subtract(1, 'days')

    let x = 0

    let dates = []

    for(let i = first; i < last; x++) {
      if( x != 0 ){
        i = i.add(1, 'days')
      }

      dates.push( i.format('YYYY-MM-DD') )
    }

    return dates
  }

  setMontos( data, cats, id ){
    let dataMonto = []
    let dataMontoElse = []
    let dataAcum  = []

    let i = 0
    for( let date of cats ){
      let valIn = 0
      let valElse = 0

      if( data[date] ){

        if( data[date]['monto'] != null ){
          valIn = parseFloat( data[date]['monto'] )
        }

        if( data[date]['monto_else'] != null ){
          valElse = parseFloat( data[date]['monto_else'] )
        }
      }

      dataMonto.push( valIn )
      dataMontoElse.push( valElse )

      if( i == 0 ){
        dataAcum.push( parseFloat( ( valIn + valElse ).toFixed(2) ) )
      }else{
        dataAcum.push( parseFloat( ( valIn + valElse + dataAcum[ i - 1 ] ).toFixed(2) ) )
      }

      i++
    }

    if( this.activeTab == 'montos' || id == 'montos' ){
      this.chart['montos'].title.update( {text: `Avance Diario de Venta - <small>${this.name}</small>`, useHTML: true} )
      this.chart['montos'].subtitle.update( {text: `<small style='font-size:smaller'>(Actualizado: ${ this.LU })</small>`, useHTML: true} )
      this.chart['montos'].update( {tooltip: {
                                        formatter: function () {
                                            let s = `<b>${this.x}</b><br/>`

                                            for( let serie of this.point.series.chart.series ){
                                              s = `${ s }<br/>${serie.name}: $ ${(serie.data[this.point.index].y).toLocaleString('mx-ES')}`
                                            }

                                            return s
                                        }
                                    }} )


      this.chart['montos']['series'][0].update( {data: dataMonto, name: 'Por día IN', type: 'column', yAxis: 1, color: "#42b0f4", stack: 'monto'} )
      this.chart['montos']['series'][1].update( {data: dataMontoElse, yAxis: 1, name: 'Por día No IN', type: 'column', stack: 'monto', color: "#0f5e8e"} )

      if( this.chart['montos']['series'][2] ){
        this.chart['montos']['series'][2].update( {data: dataAcum, name: 'Acumulado', zIndex: 100, color: '#6BCC3D'} )
      }else{
        this.chart['montos'].addSeries( {data: dataAcum, name: 'Acumulado', zIndex: 100, color: '#6BCC3D'} )
      }

      this.chart['montos']['xAxis'][0].setCategories( cats );
    }
  }

  setFC( data, cats, id ){
    let dataRsvas = []
    let dataRsvasElse = []
    let dataCalls = []
    let dataFC    = []

    let dataRsvasAcum   = []
    let dataRsvasAcumElse   = []
    let dataRsvasAcumAll   = []
    let dataCallsAcum   = []
    let dataFCAcum      = []

    let i = 0
    for( let date of cats ){

      dataRsvas.push(     this.setVal(data, date, 'rsvas', 'int') )
      dataRsvasElse.push( this.setVal(data, date, 'rsvas_else', 'int') )
      dataCalls.push(     this.setVal(data, date, 'llamadas', 'int') )

      if( dataCalls[i] == 0 ){
        dataFC.push( 0 )
      }else{
        dataFC.push( parseFloat( ( dataRsvas[i] / dataCalls[i] * 100 ).toFixed(2) ) )
      }

      //Acumulado
      if( i == 0 ){
        dataRsvasAcum.push(     dataRsvas[i] )
        dataRsvasAcumElse.push( dataRsvasElse[i] )
        dataRsvasAcumAll.push(  dataRsvasElse[i] + dataRsvas[i] )
        dataCallsAcum.push(     dataCalls[i] )
        dataFCAcum.push(        dataFC[i] )
      }else{
        dataRsvasAcum.push(     dataRsvas[i]      + dataRsvasAcum[i - 1] )
        dataRsvasAcumElse.push( dataRsvasElse[i]  + dataRsvasAcumElse[i - 1] )
        dataRsvasAcumAll.push(  dataRsvasElse[i] + dataRsvas[i]  + dataRsvasAcumAll[i - 1] )
        dataCallsAcum.push(     dataCalls[i]      + dataCallsAcum[i - 1] )

        if( dataCallsAcum[i] == 0 ){
          dataFCAcum.push( 0 )
        }else{
          dataFCAcum.push( parseFloat((dataRsvasAcum[i] / dataCallsAcum[i] * 100).toFixed(2)) )
        }
      }

      i++
    }

    //FC Chart
    if( this.activeTab == 'fc' || id == 'fc' ){
      this.chart['fc'].title.update( {text: `Avance Diario de FC% - <small>${this.name}</small>`, useHTML: true} )
      this.chart['fc'].subtitle.update( {text: `<small style='font-size:smaller'>(Actualizado: ${ this.LU })</small>`, useHTML: true} )
      this.chart['fc']['yAxis'][0].update( {title: {text: 'FC% (Rsvas / Llamadas)'}, max: null} )
      if( this.chart['fc']['yAxis'][1] ){
        this.chart['fc']['yAxis'][1].remove()
      }
      this.chart['fc'].update( {tooltip: {
                                        formatter: function () {
                                            let s = `<b>${this.x}</b><br/>`

                                            for( let serie of this.point.series.chart.series ){
                                              s = `${ s }<br/>${serie.name}: ${(serie.data[this.point.index].y).toLocaleString('mx-ES')}%`
                                            }

                                            return s
                                        }
                                    }} )

      this.chart['fc']['series'][1].update( {data: dataFCAcum, name: 'Acumulado', zIndex: 100, color: '#6BCC3D'} )
      this.chart['fc']['series'][0].update( {data: dataFC, name: 'Por día', type: 'column', color: "#42b0f4"} )
      this.chart['fc']['xAxis'][0].setCategories( cats );
    }

    //Calls Chart
    if( this.activeTab == 'calls' || id == 'calls' ){
      this.chart['calls'].title.update( {text: `Reporte Diario de Llamadas y Reservas - <small>${this.name}</small>`, useHTML: true} )
      this.chart['calls'].subtitle.update( {text: `<small style='font-size:smaller'>(Actualizado: ${ this.LU })</small>`, useHTML: true} )
      this.chart['calls']['yAxis'][0].update( {title: {text: 'Reservas (Localizadores) y Llamadas Acumuladas'}, max: null} )
      this.chart['calls']['yAxis'][1].update( {title: {text: 'Reservas (Localizadores) y Llamadas Por Día'}, max: null} )
      this.chart['calls'].update( {tooltip: {
                                        formatter: function () {
                                            let s = `<b>${this.x}</b><br/>`

                                            for( let serie of this.point.series.chart.series ){
                                              s = `${ s }<br/>${serie.name}: ${(serie.data[this.point.index].y).toLocaleString('mx-ES')}`
                                            }

                                            return s
                                        }
                                    }} )

      this.chart['calls']['series'][0].update( {data: dataRsvas,      yAxis: 1, name: 'Reservas IN', type: 'column', stack: 'rsvas', color: "#42b0f4"} )
      this.chart['calls']['series'][1].update( {data: dataCalls,      yAxis: 1, name: 'Llamadas', type: 'column', stack: 'calls', color: '#6BCC3D'} )

      if( this.chart['calls']['series'][2] ){
        this.chart['calls']['series'][2].update( {data: dataRsvasElse, yAxis: 1, name: 'Reservas No IN', type: 'column', stack: 'rsvas', color: "#0f5e8e"} )
        this.chart['calls']['series'][3].update( {data: dataRsvasAcumAll, yAxis: 0, dashStyle: 'ShortDot', name: 'Rsvas Acum', type: 'spline', color: "#42b0f4"} )
        this.chart['calls']['series'][4].update( {data: dataCallsAcum, yAxis: 0, dashStyle: 'ShortDot', name: 'Llam Acum', type: 'spline', zIndex: 100, color: '#6BCC3D'} )
      }else{
        this.chart['calls'].addSeries( {data: dataRsvasElse, yAxis: 1, name: 'Reservas No IN', type: 'column', stack: 'rsvas', color: "#0f5e8e"} )
        this.chart['calls'].addSeries( {data: dataRsvasAcumAll, yAxis: 0, dashStyle: 'ShortDot', name: 'Rsvas Acum', type: 'spline', color: "#42b0f4"} )
        this.chart['calls'].addSeries( {data: dataCallsAcum, yAxis: 0, dashStyle: 'ShortDot', name: 'Llam Acum', type: 'spline', zIndex: 100, color: '#6BCC3D'} )
      }
      this.chart['calls']['xAxis'][0].setCategories( cats );
    }
  }

  setVal( data, date, field, type = 'text' ){
    let val = 0

    if( data[date] && data[date][field] != null ){
      switch(type){
        case 'float':
          val = parseFloat( data[date][field] )
          break
        case 'int':
          val = parseInt( data[date][field] )
          break
        case 'text':
          val = data[date][field]
          break
      }

    }

    return val

  }

  timer(){
    let time = this.secReload

    if( time > 0 ){
      this.secReload = time - 1
      setTimeout( () => this.timer(), 1000 )
    }else{
      if( time == 0 ){
        this.secReload = time - 1
        this.getData()
      }
    }
  }


  test( event ){
    console.log(event)
  }

}

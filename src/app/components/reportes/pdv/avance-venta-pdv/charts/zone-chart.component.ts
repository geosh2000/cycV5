import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef, ChangeDetectionStrategy, OnChanges } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-zone-chart',
  templateUrl: './zone-chart.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneChartComponent implements AfterViewInit, OnChanges {

    @Input() data = []
    @Input() mes:any
    @Input() anio:any
    @Input() h = []
    @Input() date = []
    divWidth:number = 1200

    chart:Object = {}
    options:Object = {}
    months:any = ['','Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    @ViewChild('chartContainer') parentDiv:ElementRef;
    @HostListener('window:resize') onResize() {
      this.resizeChart()
    }

  constructor() {

    this.options = {
                    chart: {
                      width: 1200,
                      height: 700,
                      type: 'column'
                    },
                    title: {
                        text: 'Avance de venta por Zona'
                    },
                    subtitle: {
                        text: 'corte al...'
                    },
                    xAxis: {
                        categories: []
                    },
                    yAxis: [{
                        min: 0,
                        title: {
                            text: 'Monto $'
                        }
                    }],
                    legend: {
                        shadow: false
                    },
                    tooltip: {
                        shared: true
                    },
                    plotOptions: {
                        column: {
                            grouping: false,
                            shadow: false,
                            borderWidth: 0
                        }
                    },
                    series: [{
                        name: 'Meta Total Mensual',
                        color: 'rgba(204,204,255,1)',
                        data: [150, 73, 20],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.2,
                        pointPlacement: -0.2
                    }, {
                        name: 'Meta Total al día',
                        color: 'rgba(165,170,217,1)',
                        data: [140, 90, 40],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.3,
                        pointPlacement: -0.2
                    }, {
                        name: 'Monto Total Vendido',
                        color: 'rgba(126,86,134,.9)',
                        data: [150, 73, 20],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.4,
                        pointPlacement: -0.2
                    }, {
                        name: 'Meta Hotel Mensual',
                        color: 'rgba(255,204,153,1)',
                        data: [140, 90, 40],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.2,
                        pointPlacement: 0.2
                    }, {
                      name: 'Meta Hotel al día',
                      color: 'rgba(248,161,63,1)',
                      data: [183.6, 178.8, 198.5],
                      tooltip: {
                          valuePrefix: '$'
                      },
                      pointPadding: 0.3,
                      pointPlacement: 0.2,
                  }, {
                      name: 'Monto Hotel Vendido',
                      color: 'rgba(186,60,61,.9)',
                      data: [203.6, 198.8, 208.5],
                      tooltip: {
                          valuePrefix: '$'
                      },
                      pointPadding: 0.4,
                      pointPlacement: 0.2,
                  }]
                }

  }


  ngAfterViewInit() {
    this.resizeChart()
    this.setData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setData()
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      // console.log(this.chart)
  }

  setData(){
    if( this.chart['zones'] && this.data.length > 0 ){

      let mes = this.mes ? parseInt(this.mes) : parseInt(moment().format('MM'))
      let anio = this.anio ? parseInt(this.anio) : parseInt(moment().format('YYYY'))
      let days = parseInt(moment().format('MM')) == mes && parseInt(moment().format('YYYY')) == anio ? parseInt(moment().format('DD')) : parseInt(moment(`${anio}-${mes}-01`).add(1, 'month').subtract(1,'days').format('DD'))

      // GET ZONES
      let zones = [], metaT = [], metaTD = [], metaH = [], metaHD = [], montoT = [], montoH = [] , x = 0
      for( let i of this.data ){
        zones.push(i['Zona'])
        metaT.push(parseInt(i['meta_Zona']))
        metaTD.push(Math.round(i['meta_Zona_diaria']*days))
        metaH.push(parseInt(i['MetaHotel_Zona']))
        metaHD.push(Math.round(i['MetaHotel_Zona_diaria']*days))
        montoT.push(parseInt(i['Monto']))
        montoH.push(parseInt(i['MontoHotel']))
        x++
      }

      this.chart['zones'].xAxis[0].setCategories(zones)
      this.chart['zones']['series'][0].update( { data: metaT } )
      this.chart['zones']['series'][1].update( { data: metaTD } )
      this.chart['zones']['series'][2].update( { data: montoT } )
      this.chart['zones']['series'][3].update( { data: metaH } )
      this.chart['zones']['series'][4].update( { data: metaHD } )
      this.chart['zones']['series'][5].update( { data: montoH } )

      this.chart['zones'].title.update({ text: `Avance por zona || ${ this.months[parseInt(this.mes)] } - ${this.anio}`})
      this.chart['zones'].subtitle.update({ text: `Corte al ${ parseInt(moment().format('MM')) == mes && parseInt(moment().format('YYYY')) == anio ? moment().format('DD MMM \'YY') : moment(`${anio}-${mes}-01`).add(1, 'month').subtract(1,'days').format('DD MMM \'YY') }`})



      // if( this.h && this.h['ly'] && this.h['ly']['name'] ){
      //   this.chart['zones']['series'][0].update( { name: this.h['ly']['name'], data: this.h['ly']['data'], type: this.h['ly']['type'] } )
      // }

      // if( this.h && this.h['lw'] && this.h['lw']['name'] ){
      //   this.chart['zones']['series'][1].update( { name: this.h['lw']['name'], data: this.h['lw']['data'], type: this.h['lw']['type'] } )
      // }

      // if( this.data && this.data['Abandon'] && this.data['Abandon']['name'] ){
      //   this.chart['zones']['series'][2].update( { name: this.data['Abandon']['name'], color: this.data['Abandon']['color'], data: this.data['Abandon']['data'] })
      // }

      // if( this.data && this.data['PDV'] && this.data['PDV']['name'] ){
      //   this.chart['zones']['series'][3].update( { name: this.data['PDV']['name'], color: this.data['PDV']['color'], data: this.data['PDV']['data'] })
      // }

      // if( this.data && this.data['Mixcoac'] && this.data['Mixcoac']['name'] ){
      //   this.chart['zones']['series'][4].update( { name: this.data['Mixcoac']['name'], color: this.data['Mixcoac']['color'], data: this.data['Mixcoac']['data'] })
      // }

      // if( this.data && this.data['IN'] && this.data['IN']['name'] ){
      //   this.chart['zones']['series'][5].update( { name: this.data['IN']['name'], color: this.data['IN']['color'], data: this.data['IN']['data'] })
      // }

      // if( this.data && this.data['Forecast'] && this.data['Forecast']['name'] ){
      //   this.chart['zones']['series'][9].update( { name: this.data['Forecast']['name'], color: this.data['Forecast']['color'], data: this.data['Forecast']['data'], type: 'line' })
      // }
      // // AHT

      // if( this.data && this.data['PDV'] && this.data['PDV']['name'] ){
      //   this.chart['zones']['series'][6].update( { name: `AHT - ${this.data['PDV']['name']}`, color: this.data['PDV']['color'], data: this.data['PDV']['aht'], type: 'line', yAxis: 1 })
      // }

      // if( this.data && this.data['Mixcoac'] && this.data['Mixcoac']['name'] ){
      //   this.chart['zones']['series'][7].update( { name: `AHT - ${this.data['Mixcoac']['name']}`, color: this.data['Mixcoac']['color'], data: this.data['Mixcoac']['aht'], type: 'line', yAxis: 1 })
      // }

      // if( this.data && this.data['IN'] && this.data['IN']['name'] ){
      //   this.chart['zones']['series'][8].update( { name: `AHT - ${this.data['IN']['name']}`, color: this.data['IN']['color'], data: this.data['IN']['aht'], type: 'line', yAxis: 1 })
      // }

      // this.chart['zones'].title.update({ text: `Llamadas ${ this.date }`})
      // // this.chart['zones'].subtitle.update({ text: `$${this.totals[group].toLocaleString('es-MX')} (Last Update: ${ this.lu })`})
      // this.resizeChart()
    }
  }

  resizeChart(){
    // guard against resize before view is rendered
    if(this.parentDiv) {
      this.divWidth = this.parentDiv.nativeElement.clientWidth;

      if( this.chart ){
        // tslint:disable-next-line:forin
        for( let group in this.chart ){
          let h = this.divWidth*1000/2200
          this.chart['zones'].setSize(this.divWidth, h);
        }
      }
    }
  }


}

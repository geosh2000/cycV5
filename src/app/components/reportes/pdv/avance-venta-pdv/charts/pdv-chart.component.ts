import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef, ChangeDetectionStrategy, OnChanges } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pdv-chart',
  templateUrl: './pdv-chart.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdvChartComponent implements AfterViewInit, OnChanges {

    @Input() data = []
    @Input() mes:any
    @Input() anio:any
    @Input() filterZone:any
    @Input() sizeFlag = moment()
    @Input() h = []
    @Input() date = []
    divWidth:number = 1200

    chart:Object = {}
    options:Object = {}
    months:any = ['','Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    originalData:any = []
    originalFilterZone:any = ''

    @ViewChild('chartContainerSuper') parentDiv:ElementRef;
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
                        text: 'Avance de venta por PDV'
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
                        data: [],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.2,
                        pointPlacement: -0.2
                    }, {
                        name: 'Meta Total al día',
                        color: 'rgba(165,170,217,1)',
                        data: [],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.3,
                        pointPlacement: -0.2
                    }, {
                        name: 'Monto Total Vendido',
                        color: 'rgba(126,86,134,.9)',
                        data: [],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.4,
                        pointPlacement: -0.2
                    }, {
                        name: 'Meta Hotel Mensual',
                        color: 'rgba(255,204,153,1)',
                        data: [],
                        tooltip: {
                            valuePrefix: '$'
                        },
                        pointPadding: 0.2,
                        pointPlacement: 0.2
                    }, {
                      name: 'Meta Hotel al día',
                      color: 'rgba(248,161,63,1)',
                      data: [],
                      tooltip: {
                          valuePrefix: '$'
                      },
                      pointPadding: 0.3,
                      pointPlacement: 0.2,
                  }, {
                      name: 'Monto Hotel Vendido',
                      color: 'rgba(186,60,61,.9)',
                      data: [],
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
    // console.log(changes)
    if( changes['data'] || changes['filterZone'] ){
      this.setData()
    }
    if( changes['sizeFlag'] ){
      this.resizeChart()
    }
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      // console.log(this.chart)
  }

  setData(){

    // console.log(this)
    if( this.chart['pdv'] && this.data.length > 0 ){

      let mes = this.mes ? parseInt(this.mes) : parseInt(moment().format('MM'))
      let anio = this.anio ? parseInt(this.anio) : parseInt(moment().format('YYYY'))
      let days = parseInt(moment().format('MM')) == mes && parseInt(moment().format('YYYY')) == anio ? parseInt(moment().format('DD')) : parseInt(moment(`${anio}-${mes}-01`).add(1, 'month').subtract(1,'days').format('DD'))

      // GET Supers
      let supers = [], metaT = [], metaTD = [], metaH = [], metaHD = [], montoT = [], montoH = [] , x = 0
      for( let i of this.data ){
        if(i['Supervisor'] == this.filterZone){
          supers.push(i['PDV'])
          metaT.push(parseInt(i['meta_PDV']))
          metaTD.push(Math.round(i['meta_PDV_diaria']*days))
          metaH.push(parseInt(i['MetaHotel_PDV']))
          metaHD.push(Math.round(i['MetaHotel_PDV_diaria']*days))
          montoT.push(parseInt(i['Monto']))
          montoH.push(parseInt(i['MontoHotel']))
        }
        x++
      }

      this.chart['pdv'].xAxis[0].setCategories(supers)
      this.chart['pdv']['series'][0].update( { data: metaT } )
      this.chart['pdv']['series'][1].update( { data: metaTD } )
      this.chart['pdv']['series'][2].update( { data: montoT } )
      this.chart['pdv']['series'][3].update( { data: metaH } )
      this.chart['pdv']['series'][4].update( { data: metaHD } )
      this.chart['pdv']['series'][5].update( { data: montoH } )

      this.chart['pdv'].title.update({ text: `Avance por PDV (Supervisor ${this.filterZone}) || ${ this.months[parseInt(this.mes)] } - ${this.anio}`})
      this.chart['pdv'].subtitle.update({ text: `Corte al ${ parseInt(moment().format('MM')) == mes && parseInt(moment().format('YYYY')) == anio ? moment().format('DD MMM \'YY') : moment(`${anio}-${mes}-01`).add(1, 'month').subtract(1,'days').format('DD MMM \'YY') }`})

      this.originalData = this.data
      this.originalFilterZone = this.filterZone
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
          this.chart['pdv'].setSize(this.divWidth, h);
        }
      }
    }
  }


}

import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-graph-outlet',
  templateUrl: './graph-outlet.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphOutletComponent implements AfterViewInit {

  divWidth:number = 1200

  @ViewChild('chartContainer') parentDiv:ElementRef;
  @HostListener('window:resize') onResize() {
    this.resizeChart()
  }

  @Input() data = []
  @Input() h = []
  @Input() date:string

  chart:Object = {}
  options:Object = {}

  constructor() {

    this.options = {
                    chart: {
                      width: 1400,
                      height: 800
                    },
                    title: {
                        text: 'Loading...'
                    },

                    xAxis: {
                      type: 'datetime',
                      crosshair: true
                    },
                    yAxis: [{
                                title: {
                                    text: 'Monto'
                                }
                            }],
                    legend: {
                        enabled: true
                    },
                    tooltip: {
                        borderWidth: 0,
                        backgroundColor: 'none',
                        pointFormat: '${point.y:,.2f}',
                        headerFormat: '',
                        shadow: false,
                        style: {
                            fontSize: '12px'
                        },
                        valueDecimals: 2
                    },
                    plotOptions: {
                        area: {
                            fillColor: {
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1
                                },
                                stops: [
                                          [0, 'red'],
                                          [1, 'red']
                                      ]
                            },
                            marker: {
                                radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },

                    series: [{
                        type: 'column',
                        name: '1',
                        data: []
                    },{
                        type: 'spline',
                        name: '2',
                        data: []
                    },{
                        type: 'spline',
                        name: '3',
                        data: []
                    },{
                        type: 'column',
                        name: '4',
                        data: []
                    },{
                        type: 'spline',
                        name: '5',
                        data: []
                    },{
                        type: 'spline',
                        name: '6',
                        data: []
                    },{
                        type: 'spline',
                        name: '7',
                        data: []
                    }]
                }

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
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
    if( this.chart['outlet'] ){

      if(this.data[this.date]){
        this.chart['outlet']['series'][0].update(
          { name: 'LY', data: this.data[this.date]['ly'], type: 'spline', dashStyle: 'ShortDot' } )
        this.chart['outlet']['series'][1].update(
          { name: 'Current', data: this.data[this.date]['ty'], type: 'spline' } )
        this.chart['outlet']['series'][2].update(
          { name: 'Hotel', data: this.data[this.date]['hotel'], type: 'spline' } )
        this.chart['outlet']['series'][3].update(
          { name: 'Meta 2018', data: this.data[this.date]['meta'], type: 'line', marker: { enabled: false}, dashStyle: 'ShortDot' } )
        this.chart['outlet']['series'][4].update(
          { name: 'Meta Hotel', data: this.data[this.date]['meta_hotel'], type: 'line', marker: { enabled: false}, dashStyle: 'ShortDot' } )
        this.chart['outlet']['series'][5].update(
          { name: 'Meta BI 2018', data: this.data[this.date]['meta_bi'], type: 'line', marker: { enabled: false}, dashStyle: 'ShortDot' } )
        this.chart['outlet']['series'][6].update(
          { name: 'Meta BI Hotel', data: this.data[this.date]['meta_bi_hoteles'], type: 'line', marker: { enabled: false}, dashStyle: 'ShortDot' } )

      }

      this.chart['outlet'].title.update({ text: `Outlet ${ this.date == 'Todo' ? '10 al 13 de Mayo' : moment(this.date).format('DD MMM YYYY')}`})
      // this.chart['calls'].subtitle.update({ text: `$${this.totals[group].toLocaleString('es-MX')} (Last Update: ${ this.lu })`})
      this.resizeChart()
    }
  }

  resizeChart(){
    // guard against resize before view is rendered
    if(this.parentDiv) {
      this.divWidth = this.parentDiv.nativeElement.clientWidth;

      if( this.chart ){
        for( let group in this.chart ){
          let h = this.divWidth*1000/2200
          this.chart['outlet'].setSize(this.divWidth, h);
        }
      }
    }
  }


}

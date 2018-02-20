import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-graph-call-stats',
  templateUrl: './graph-call-stats.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphCallStatsComponent implements AfterViewInit {

  divWidth:number = 1200

  @ViewChild('chartContainer') parentDiv:ElementRef;
  @HostListener('window:resize') onResize() {
    this.resizeChart()
  }

  @Input() data = []
  @Input() h = []
  @Input() date = []

  chart:Object = {}
  options:Object = {}

  constructor() {

    this.options = {
                title: {
                    text: 'Participación por 800'
                },
                chart: {
                  width: 1400,
                  height: 800,
                  type: 'column'
                },
                xAxis: {
                  type: 'datetime',
                  crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total de llamadas'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    }
                },
                legend: {
                    align: 'right',
                    x: -30,
                    verticalAlign: 'top',
                    y: 25,
                    floating: true,
                    backgroundColor: 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'lw',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#a50092'
                },{
                    name: 'ly',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'Abandon',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'PDV',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'IN',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
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
    if( this.chart['calls'] ){
      if( this.h && this.h['ly'] && this.h['ly']['name'] ){
        this.chart['calls']['series'][0].update( { name: this.h['ly']['name'], data: this.h['ly']['data'], type: this.h['ly']['type'] } )
      }

      if( this.h && this.h['lw'] && this.h['lw']['name'] ){
        this.chart['calls']['series'][1].update( { name: this.h['lw']['name'], data: this.h['lw']['data'], type: this.h['lw']['type'] } )
      }

      if( this.data && this.data['Abandon'] && this.data['Abandon']['name'] ){
        this.chart['calls']['series'][2].update( { name: this.data['Abandon']['name'], color: this.data['Abandon']['color'], data: this.data['Abandon']['data'] })
      }

      if( this.data && this.data['PDV'] && this.data['PDV']['name'] ){
        this.chart['calls']['series'][3].update( { name: this.data['PDV']['name'], color: this.data['PDV']['color'], data: this.data['PDV']['data'] })
      }

      if( this.data && this.data['IN'] && this.data['IN']['name'] ){
        this.chart['calls']['series'][4].update( { name: this.data['IN']['name'], color: this.data['IN']['color'], data: this.data['IN']['data'] })
      }

      this.chart['calls'].title.update({ text: `Llamadas ${ moment(this.date).format('DD MMM YYYY')}`})
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
          this.chart['calls'].setSize(this.divWidth, h);
        }
      }
    }
  }


}

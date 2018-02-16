import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-path-select',
  templateUrl: './path-select.component.html',
  styles: []
})
export class PathSelectComponent implements AfterViewInit {

  divWidth:number = 1200

  @ViewChild('chartContainer') parentDiv:ElementRef;
  @HostListener('window:resize') onResize() {
    this.resizeChart()
  }

  @Input() data = []
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
                  height: 800
                },
                plotOptions: {
                  series: {
                    dataLabels: {
                      rotation: 270,
                    }
                  }
                },

                series: [{
                    keys: ['from', 'to', 'weight'],
                    data: [],
                    dataLabels: {
                        nodeFormat: '{point.name}<br>{point.sum}',
                        useHTML: true,
                        enabled: true,
                        filter: {
                            property: 'sum',
                            operator: '>',
                            value: 0
                        },
                        // nodeFormat: '{point.name}: {point.sum}%',
                        padding: 20,
                        style: {
                            fontSize: '0.7 em'
                        }
                    },
                    type: 'sankey'
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
    console.log(this.chart)
    this.chart['ivr']['series'][0].setData( this.data )
    this.chart['ivr'].title.update({ text: `Participación por 800 ${ moment(this.date).format('DD MMM YYYY')}`})
    this.resizeChart()
  }

  resizeChart(){
    // guard against resize before view is rendered
    if(this.parentDiv) {
      this.divWidth = this.parentDiv.nativeElement.clientWidth;

      if( this.chart ){
        for( let group in this.chart ){
          let h = this.divWidth*1000/2200
          this.chart['ivr'].setSize(this.divWidth, h);
        }
      }
    }
  }


}

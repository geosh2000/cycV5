import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef, OnChanges } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-survey-graph',
  templateUrl: './survey-graph.component.html',
  styles: []
})
export class SurveyGraphComponent implements AfterViewInit, OnChanges {

  @Input() data = []
  @Input() date:any = ''
  @Input() title:any = 'Tipificación'

  @ViewChild('chartContainer') parentDiv:ElementRef;
  @HostListener('window:resize') onResize() {
    this.resizeChart()
  }

  // tslint:disable-next-line:member-ordering
  divWidth:number = 1200
  // tslint:disable-next-line:member-ordering
  chart:Object = {}
  // tslint:disable-next-line:member-ordering
  options:Object = {}

  constructor() {

    this.options = {
                title: {
                    text: 'Formulario de Tipificación'
                },
                chart: {
                  width: 1200,
                  height: 800
                },
                series: [{
                    keys: ['from', 'to', 'weight'],
                    data: [],
                    type: 'sankey'
                }]

            }

  }

  ngAfterViewInit() {
    this.setData()
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout( () => {
      if( this.chart['chart'] ){
        this.setData()
      }
    }, 500)
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      console.log(this.chart)
  }

  setData(){
    console.log(this.data)
    this.chart['chart']['series'][0].setData( this.data )
    this.chart['chart'].title.update({ text: `Formulario de ${this.title} (${this.date})`})
    this.resizeChart()
  }

  resizeChart(){
    // guard against resize before view is rendered
    if(this.parentDiv) {
      this.divWidth = this.parentDiv.nativeElement.clientWidth;

      if( this.chart ){
        // tslint:disable-next-line:forin
        for( let group in this.chart ){
          let h = this.divWidth*.9*800/1200
          this.chart['chart'].setSize(this.divWidth*.9, h*.85);
        }
      }
    }
  }


}

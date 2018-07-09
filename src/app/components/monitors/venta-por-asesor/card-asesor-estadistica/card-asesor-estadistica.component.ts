import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-card-asesor-estadistica',
  templateUrl: './card-asesor-estadistica.component.html',
  styles: []
})
export class CardAsesorEstadisticaComponent implements AfterViewInit {

  @Input() asesor: any
  @Input() metas: any
  @Input() dept: any

  chart: Object = {}
  options: Object = {}

  depto: any
  asesorImage = 'assets/img/no-image.png'
  dataDisplay: Object = {
    nombre: '',
    colab: '',
    lu: '',
    mensual: {
      total   : 0,
      hotel   : 0,
      paquete : 0,
      vuelo   : 0,
      tour    : 0,
      transfer: 0,
      otros   : 0,
      rsvas   : 0,
      llamadas: 0,
      llamadas_all : 0,
      tt      : 0,
      ttOut   : 0,
      llamadasOut : 0
    },
    hoy: {
      total   : 0,
      hotel   : 0,
      paquete : 0,
      vuelo   : 0,
      tour    : 0,
      transfer: 0,
      otros   : 0,
      rsvas   : 0,
      llamadas: 0,
      llamadas_all : 0,
      tt      : 0,
      ttOut   : 0,
      llamadasOut : 0
    }
  }

  constructor() {
    this.options = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    width: 160,
                    height: 130
                },
                credits: {
                  enabled: false
                },
                exporting: {
                  enabled: false
                },
                title: {
                    text: ''
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        size: 115,
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: false
                    }
                },
                series: [{
                    name: 'Share Productos',
                    colorByPoint: true,
                    data: [{
                        name: 'Hotel',
                        y: 1,
                        sliced: true,
                        selected: true
                    }, {
                        name: 'Paquete',
                        y: 2
                    }, {
                        name: 'Vuelos',
                        y: 3
                    }, {
                        name: 'Otros',
                        y: 97
                    }]
                }]
            }
  }

  ngAfterViewInit() {
      this.getData()
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges(changes: SimpleChanges) {
    if ( this.chart['mensual'] ){
      this.getData()
    }
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      // console.log(this.chart)
  }

  getData( ){

    this.buildData( () => {
      // console.log(this.chart)
      this.depto = this.dept
      console.log(this.dept)
      console.log(this.metas)
      let mensual = this.dataDisplay['mensual']
      let hoy = this.dataDisplay['hoy']

      let totalMes = mensual.hotel + mensual.paquete + mensual.vuelo + mensual.otros
      let totalHoy = hoy.hotel + hoy.paquete + hoy.vuelo + hoy.otros

      let mes = [
        {y: (mensual.hotel / totalMes * 100),   name: 'Hotel', sliced: true, select: true },
        {y: ((this.dept != 50 ? mensual.paquete : mensual.tour) / totalMes * 100),  name: this.dept != 50 ? 'Paquete' : 'Tour' },
        {y: ((this.dept != 50 ? mensual.vuelo : mensual.transfer) / totalMes * 100),  name: this.dept != 50 ? 'Vuelo' : 'Transfer' },
        {y: (mensual.otros / totalMes * 100),   name: 'Otros' }
      ]

      let td = [
        {y: (hoy.hotel / totalHoy * 100),   name: 'Hotel', sliced: true, select: true },
        {y: ((this.dept != 50 ? hoy.paquete : hoy.tour) / totalHoy * 100),  name: this.dept != 50 ? 'Paquete' : 'Tour' },
        {y: ((this.dept != 50 ? hoy.vuelo : hoy.transfer) / totalHoy * 100),  name: this.dept != 50 ? 'Vuelo' : 'Transfer' },
        {y: (hoy.otros / totalHoy * 100),   name: 'Otros' }
      ]

      this.chart['mensual']['series'][0].setData( mes )
      this.chart['hoy']['series'][0].setData( td )

      if (this.dataDisplay['colab'] != null){
        this.asesorImage = `/img/asesores/${this.dataDisplay['colab']}.jpg`
      }else{
        this.asesorImage = 'assets/img/no-image.png'
      }

    })

  }

  buildData( callback ){

    console.log(this.asesor)

    if ( this.asesor ){

      let data = {
        nombre: '',
        colab: '',
        lu: '',
        mensual: {
          total   : 0,
          hotel   : 0,
          paquete : 0,
          vuelo   : 0,
          tour    : 0,
          transfer: 0,
          otros   : 0,
          rsvas   : 0,
          llamadas: 0,
          llamadas_all : 0,
          tt      : 0,
          ttOut   : 0,
          llamadasOut : 0
        },
        hoy: {
          total   : 0,
          hotel   : 0,
          paquete : 0,
          vuelo   : 0,
          tour    : 0,
          transfer: 0,
          otros   : 0,
          rsvas   : 0,
          llamadas: 0,
          llamadas_all : 0,
          tt      : 0,
          ttOut   : 0,
          llamadasOut : 0
        }
      }

      for (let item of this.asesor){

        if ( moment(item.Fecha).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
          data['hoy'].total     += parseFloat(item.monto_total)
          data['hoy'].hotel     += parseFloat(item.monto_hotel)
          data['hoy'].paquete   += parseFloat(item.monto_paquete)
          data['hoy'].vuelo     += parseFloat(item.monto_vuelo)
          data['hoy'].tour     += parseFloat(item.monto_tours)
          data['hoy'].transfer     += parseFloat(item.monto_transfer)
          data['hoy'].otros     += parseFloat(item.monto_otros)
          data['hoy'].rsvas     += parseFloat(item.rsvas_total)
          data['hoy'].llamadas  += parseInt(item.llamadas_total)
          data['hoy'].llamadas_all  += parseInt(item.llamadas_total)
          data['hoy'].tt        += parseInt(item.talking_time)
          data['hoy'].ttOut        += parseInt(item.talking_timeOut)
          data['hoy'].llamadasOut        += parseInt(item.llamadasOut)
        }

        data.nombre = item.nombre
        data.colab  = item.colab
        data.lu     = moment.tz(item.Last_Update, 'America/Mexico_city').tz('America/Bogota').format('DD MM \'YY')
        data['mensual'].total     += parseFloat(item.monto_total)
        data['mensual'].hotel     += parseFloat(item.monto_hotel)
        data['mensual'].paquete   += parseFloat(item.monto_paquete)
        data['mensual'].vuelo     += parseFloat(item.monto_vuelo)
        data['mensual'].tour     += parseFloat(item.monto_tours)
        data['mensual'].transfer     += parseFloat(item.monto_transfer)
        data['mensual'].otros     += parseFloat(item.monto_otros)
        data['mensual'].rsvas     += parseFloat(item.rsvas_total)
        data['mensual'].llamadas  += parseInt(item.llamadas_total)
        data['mensual'].llamadas_all  += parseInt(item.llamadas_total)
        data['mensual'].tt        += parseInt(item.talking_time)
        data['mensual'].ttOut        += parseInt(item.talking_timeOut)
        data['mensual'].llamadasOut        += parseInt(item.llamadasOut)

      }

      this.dataDisplay = data

      if (typeof callback == 'function') {
          callback();
      }

    }
  }



  updateImg(event){
    let d = new Date()
    this.asesorImage = `assets/img/no-image.png`
  }

  alcance( monto: any, total: any, alDia = false ){

    if (alDia){
      let dias = parseInt(moment().format('DD'))
      total = total * dias
    }

    return parseFloat( monto ) / parseFloat(total) * 100
  }

}

import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges } from '@angular/core';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-card-asesor-estadistica',
  templateUrl: './card-asesor-estadistica.component.html',
  styles: []
})
export class CardAsesorEstadisticaComponent implements AfterViewInit {

  @Input() asesor:any
  @Input() metas:any

  chart:Object = {}
  options:Object = {}

  asesorImage = "assets/img/no-image.png"
  dataDisplay:Object = {
    nombre: '',
    colab: '',
    lu: '',
    mensual: {
      total   : 0,
      hotel   : 0,
      paquete : 0,
      vuelo   : 0,
      otros   : 0,
      rsvas   : 0,
      llamadas: 0,
      llamadas_all : 0,
      tt      : 0
    },
    hoy: {
      total   : 0,
      hotel   : 0,
      paquete : 0,
      vuelo   : 0,
      otros   : 0,
      rsvas   : 0,
      llamadas: 0,
      llamadas_all : 0,
      tt      : 0
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
                credits:{
                  enabled: false
                },
                exporting:{
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

  ngOnChanges(changes: SimpleChanges) {

    // this.getData()
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      // console.log(this.chart)
  }

  getData( ){

    this.buildData( () => {
      // console.log(this.chart)

      let mensual = this.dataDisplay['mensual']
      let hoy = this.dataDisplay['hoy']

      let totalMes = mensual.hotel + mensual.paquete + mensual.vuelo + mensual.otros
      let totalHoy = hoy.hotel + hoy.paquete + hoy.vuelo + hoy.otros

      let mes = [
        {y: (mensual.hotel / totalMes * 100),   name: 'Hotel', sliced: true, select: true },
        {y: (mensual.paquete / totalMes * 100), name: 'Paquete' },
        {y: (mensual.vuelo / totalMes * 100),  name: 'Vuelos' },
        {y: (mensual.otros / totalMes * 100),   name: 'Otros' }
      ]

      let td = [
        {y: (hoy.hotel / totalHoy * 100),   name: 'Hotel', sliced: true, select: true },
        {y: (hoy.paquete / totalHoy * 100), name: 'Paquete' },
        {y: (hoy.vuelo / totalHoy * 100),  name: 'Vuelos' },
        {y: (hoy.otros / totalHoy * 100),   name: 'Otros' }
      ]

      this.chart['mensual']['series'][0].setData( mes )
      this.chart['hoy']['series'][0].setData( td )

      if(this.dataDisplay['colab'] != null){
        let d = new Date()
        this.asesorImage = `/img/asesores/${this.dataDisplay['colab']}.jpg?${d.getTime()}`
      }else{
        this.asesorImage = "assets/img/no-image.png"
      }

    })

  }

  buildData( callback ){

    console.log(this.asesor)

    if( this.asesor ){

      let data = {
        nombre: '',
        colab: '',
        lu: '',
        mensual: {
          total   : 0,
          hotel   : 0,
          paquete : 0,
          vuelo   : 0,
          otros   : 0,
          rsvas   : 0,
          llamadas: 0,
          llamadas_all : 0,
          tt      : 0
        },
        hoy: {
          total   : 0,
          hotel   : 0,
          paquete : 0,
          vuelo   : 0,
          otros   : 0,
          rsvas   : 0,
          llamadas: 0,
          llamadas_all : 0,
          tt      : 0
        }
      }

      for(let item of this.asesor){
        let group = 'mensual'
        if( moment(item.Fecha).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
          group = 'hoy'
        }
        data.nombre = item.nombre
        data.colab  = item.colab
        data.lu     = moment.tz(item.Last_Update, 'America/Mexico_city').tz('America/Bogota').format('dd MMM \'YY')
        data[group].total     += parseFloat(item.monto_total)
        data[group].hotel     += parseFloat(item.monto_hotel)
        data[group].paquete   += parseFloat(item.monto_paquete)
        data[group].vuelo     += parseFloat(item.monto_vuelo)
        data[group].otros     += parseFloat(item.monto_otros)
        data[group].rsvas     += parseFloat(item.rsvas_total)
        data[group].llamadas  += (parseInt(item.llamadas_total) - parseInt(item.llamadas_xfered))
        data[group].llamadas_all  += parseInt(item.llamadas_total)
        data[group].tt        += parseInt(item.talking_time)
      }

      this.dataDisplay = data

      if (typeof callback === "function") {
          callback();
      }

    }
  }

  updateImg(event){
    let d = new Date()
    this.asesorImage=`assets/img/no-image.png`
  }

  alcance( monto:any, total:any, alDia = false ){

    if(alDia){
      let dias = parseInt(moment().format('DD'))
      total = total*dias
    }

    return parseFloat( monto ) / parseFloat(total) * 100
  }

}

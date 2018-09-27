import { Component, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import * as moment from 'moment-timezone';

import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';

declare var jQuery:any;

@Component({
  selector: 'app-dash-por-hora',
  templateUrl: './dash-por-hora.component.html',
  styles: []
})
export class DashPorHoraComponent implements AfterViewInit {

  divWidth:number = 1200

  @ViewChild('chartContainer') parentDiv:ElementRef;

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  large:boolean = true
  mainCredential:string = 'tablas_f'
  timeout:any

  loading:Object = {}

  timerCount:number = 300
  timeToReload:number = 300

  data:any
  dataAcum:any
  totals:any = {}
  lu:any
  chart:Object = {}
  options:Object = {}

  monthSelected:string = `-${moment().format('MM')}`
  dateStart:any = moment(`${moment().format(`YYYY${this.monthSelected}`)}-01`).format('YYYY-MM-DD')
  dateEnd:any = moment(`${moment(moment(`${moment().format(`YYYY${this.monthSelected}`)}-01`)).add(35, 'days').format('YYYY-MM')}-01`).subtract(1, 'days').format('YYYY-MM-DD')

  params:Object = {
    start : '',
    end   : '',
    marca : 'Marcas Propias',
    pais  : 'MX',
    soloVenta: true
  }

  months:Object = {
    '-01'  : 'Enero',
    '-02'  : 'Febrero',
    '-03'  : 'Marzo',
    '-04'  : 'Abril',
    '-05'  : 'Mayo',
    '-06'  : 'Junio',
    '-07'  : 'Julio',
    '-08'  : 'Agosto',
    '-09'  : 'Septiembre',
    '-10'  : 'Octubre',
    '-11'  : 'Noviembre',
    '-12'  : 'Diciembre',
  }

  titles = {
    In          : "CC-In",
    Out         : "CC-Out",
    Presencial  : "PDV",
    Online      : "Online",
    Total       : "Total",
    Com         : ".COM",
    Outlet         : "Outlet"
  }

  dates:any = []

  btnWidth:number = 100
  btnFormat:string = "ddd DD MMM"

  constructor(public _api: ApiService,
                private titleService: Title,
                private _init:InitService,
                private _zh:ZonaHorariaService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService) {
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

    this.options = {
                    chart: {
                      width: 1200,
                      zoomType: 'x',
                      marginLeft: 40, // Keep all charts left aligned
                      spacingTop: 20,
                      spacingBottom: 20
                    },
                    title: {
                        text: 'Loading...'
                    },

                    subtitle: {
                        text: 'loading...'
                    },
                    xAxis: {
                      type: 'datetime',
                      crosshair: true
                    },
                    yAxis: [{
                                title: {
                                    text: 'Acumulado'
                                },
                                opposite: true
                            },{
                                title: {
                                    text: 'Por Hora'
                                }
                            }],
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        positioner: function () {
                            return {
                                // right aligned
                                x: this.chart.chartWidth - this.label.width - 25,
                                y: 10 // align to title
                            };
                        },
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
                        name: 'Por Hora',
                        yAxis: 1,
                        data: [
                                [
                                  1370131200000,
                                  0.7695
                                ],
                                [
                                  1370217600000,
                                  0.7648
                                ]
                              ]
                    },{
                        type: 'spline',
                        name: 'Acumulado',
                        data: [
                                [
                                  1370131200000,
                                  0.7695
                                ],
                                [
                                  1370217600000,
                                  0.7648
                                ]
                              ]
                    },{
                        type: 'spline',
                        name: 'Acumulado LY',
                        dashStyle: 'ShortDot',
                        data: [
                                [
                                  1370131200000,
                                  0.7695
                                ],
                                [
                                  1370217600000,
                                  0.7648
                                ]
                              ]
                    }]
                }

    //Set First Week
    if( parseInt(moment().format('E')) > 1 ){
      this.params['start'] = moment().subtract(parseInt(moment().format('E'))-1, 'days').format('YYYY-MM-DD')
    }else{
      this.params['start'] = moment().format('YYYY-MM-DD')
    }

    //Set Last Week
    if( parseInt(moment().format('E')) < 7 ){
      this.params['end'] = moment().add(7 - parseInt(moment().format('E')), 'days').format('YYYY-MM-DD')
    }else{
      this.params['end'] = moment().format('YYYY-MM-DD')
    }

    this.buildDates()
    this.timerLoad()
    console.log(this.months)

  }

  @HostListener('window:resize') onResize() {
    this.resizeChart()
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Venta Por Hora');
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  buildDates(){
    this.dates = []
    let week = []
    let start, end

    //Set First Week
    if( parseInt(moment(this.dateStart).format('E')) > 1 ){
      start = moment(this.dateStart).subtract(parseInt(moment(this.dateStart).format('E'))-1, 'days').format('YYYY-MM-DD')
    }else{
      start = moment(this.dateStart).format('YYYY-MM-DD')
    }

    //Set Last Week
    if( parseInt(moment(this.dateEnd).format('E')) < 7 ){
      end = moment(this.dateEnd).add(7 - parseInt(moment(this.dateEnd).format('E')), 'days').format('YYYY-MM-DD')
    }else{
      end = moment(this.dateEnd).format('YYYY-MM-DD')
    }


    for( let i = start; i <= end; i ){
      week.push( moment(i) )
      if( parseInt(moment(i).format('E')) == 7 ){
        this.dates.push(week)
        week = []
      }
      i = moment(i).add(1, 'days').format('YYYY-MM-DD')
      if( i > moment(end).format('YYYY-MM-DD') ){
        this.dates.push(week)
      }
    }
    console.log(this.dates)
  }

  getData(){

    this.loading['data'] = true
    this.timerCount = this.timeToReload

    this._api.restfulPut( this.params,'Venta/dashPorHora' )
            .subscribe( res => {

              this.loading['data'] = false
              this.lu = moment(res['lu']['lu']).format("DD MMM 'YY HH:mm:ss")
              this.buildData( res['data'] )
              this.timerCount = this.timeToReload
              console.log(res['data'])

            }, err => {
              console.log("ERROR", err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })



  }

  ngAfterViewInit() {
    setTimeout(_ => this.divWidth = this.parentDiv.nativeElement.clientWidth);
    this.getData()
    jQuery('.chartCont').bind('mousemove touchmove touchstart', e => this.bindChartEv(e));
  }

  highlight( point, event ){
    point.series.chart.pointer.normalize(event)
    point.onMouseOver(); // Show the hover marker
    point.series.chart.tooltip.refresh(point); // Show the tooltip
    point.series.chart.xAxis[0].drawCrosshair(event, point); // Show the crosshair
  }

  bindChartEv( e ){
    let chart,
        point,
        i,
        event;

    for ( let group in this.chart ) {
      if( (this.params['marca'] == 'Marcas Terceros' && group != 'Presencial') || this.params['marca'] == 'Marcas Propias' ){
        // Find coordinates within the chart
        event = this.chart[group].pointer.normalize(e.originalEvent);
        // Get the hovered point
        point = this.chart[group].series[1].searchPoint(event, true);
        if (point) {
            this.highlight( point, e);
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      console.log(this.chart[identifier].pointer)
      this.chart[identifier].pointer.__proto__.reset = () => { return undefined }
      this.flag = true
  }

  build(){
    this.getData()
  }

  runChart(){
    for(let group in this.chart){

      if( (this.params['marca'] == 'Marcas Terceros' && group != 'Presencial') || this.params['marca'] == 'Marcas Propias' ){

        // SET TITLE
        this.chart[group].title.update({ text: `${this.params['marca']} (${this.params['pais']}) - ${ this.titles[group] } (${ moment(this.params['start']).format('DD MMM') } a ${ moment(this.params['end']).format('DD MMM') })`})
        this.chart[group].subtitle.update({ text: `$${this.totals[group].toLocaleString('es-MX')} (Last Update: ${ this.lu })`})

        // SET DATA
        this.chart[group]['series'][0].setData( this.data['ty'][group] )
        this.chart[group]['series'][1].setData( this.dataAcum['ty'][group] )
        this.chart[group]['series'][2].setData( this.dataAcum['ly'][group] )
      }
    }
  }

  unixTime( time ){
    // DEFINE UNIX TIME
    let m = moment.tz(`${ time }`, "America/Mexico_city")
    let local = m.clone().tz( this._zh.zone )
    let dif = moment(m.format('YYYY-MM-DD HH:mm:ss')).diff(local.format('YYYY-MM-DD HH:mm:ss'), 'hours')
    m.subtract((5+(dif*(-1))), 'hours')
    return m
  }

  buildData( data ){

    let primal = {}
    let acum = {}
    let prim = {}
    let y, chan, gp
    let first = [parseInt(this.unixTime(`${this.params['start']} 00:00:00`).format('x')), 0]
    let last = [parseInt(this.unixTime(`${this.params['end']} 00:00:00`).add(1, 'days').format('x')), 0]

    for( let step of data ){

      // DEFINE UNIX TIME
      let m = this.unixTime(`${step['Fecha']} ${step['H']}`)

      // DEFINE YEAR
      if( moment(step['Fecha']).format('YYYY') == moment().format('YYYY') ){
        y = 'ty'
      }else{
        y= 'ly'
        m.add(364, 'days')
      }

      // DEFINE CHANNEL
      chan = step['gpoTipoRsvaOk']

      // DEFINE GP CHANNEL
      switch(chan){
        case 'In':
        case 'Out':
        case 'Online':
          gp = 'Com'
          break
        default:
          gp = ''
          break
      }

      // CREATE IF lineWidth
      !prim[y]          ? prim[y]         = { 'Total': []       , 'Com': [] }       : null
      !acum[y]          ? acum[y]         = { 'Total': [first]  , 'Com': [first] }  : null
      !primal[y]        ? primal[y]       = { 'Total': 0        , 'Com': 0       }  : null
      !prim[y][chan]    ? prim[y][chan]   = []                                      : null
      !acum[y][chan]    ? acum[y][chan]   = [first]                                 : null
      !primal[y][chan]  ? primal[y][chan] = 0                                       : null

      // BUILD DATA
      if( gp != '' ){
        primal[y][gp]     = primal[y][gp]       + parseFloat(step['Monto'])
        prim[y][gp]       .push([ parseInt(m.format('x')), parseFloat(step['Monto']) ])
        acum[y][gp]       .push([ parseInt(m.format('x')), primal[y][gp] ])
      }

      primal[y][chan]     = primal[y][chan]     + parseFloat(step['Monto'])
      primal[y]['Total']  = primal[y]['Total']  + parseFloat(step['Monto'])
      prim[y][chan]       .push([ parseInt(m.format('x')), parseFloat(step['Monto']) ])
      prim[y]['Total']    .push([ parseInt(m.format('x')), parseFloat(step['Monto']) ])
      acum[y][chan]       .push([ parseInt(m.format('x')), primal[y][chan] ])
      acum[y]['Total']    .push([ parseInt(m.format('x')), primal[y]['Total'] ])

    }

    for( let ch in acum['ty'] ){
      last[1] = acum['ty'][ch][acum['ty'][ch].length - 1][1]
      acum['ty'][ch].push( [last[0], primal['ty'][ch]] )
      this.totals[ch] = primal['ty'][ch]
    }

    console.log(this.dataAcum)

    this.data = prim
    this.dataAcum = acum

    if(this.flag){
      this.runChart()
      this.resizeChart()
    }
  }

  chgView( date, flag = 'both' ){

    switch( flag ){
      case "both":
      case "start":
        this.params['start'] = date
        this.params['end'] = date
        break
      case "end":
        this.params['end'] = date
        break
    }

    if( flag != 'start'){
      this.getData()
    }
  }

  buildAll(){

    this.params['start']  = this.dateStart
    this.params['end']    = this.dateEnd

    this.getData()
  }

  chgSize(){

    let w = 1200, h = 400

    if( this.large ){
      w = 360
      h = 120
    }



    this.large = !this.large

  }

  resizeChart(){
    // guard against resize before view is rendered
    if(this.parentDiv) {
      this.divWidth = this.parentDiv.nativeElement.clientWidth;

      if( this.chart ){
        for( let group in this.chart ){

            if( (this.params['marca'] == 'Marcas Terceros' && group != 'Presencial') || this.params['marca'] == 'Marcas Propias' ){
              this.chart[group].setSize(this.divWidth, 400);

              if( this.divWidth < 700 ){
                this.btnWidth  = 50
                this.btnFormat = "DD-MM"
              }else{
                this.btnWidth  = 100
                this.btnFormat = "ddd DD MMM"
              }
            }
        }
      }
    }
  }

  isSelected( date ){
    if( moment(date) >= moment(this.params['start']) && moment(date) <= moment(this.params['end']) ){
      if( date == this.params['start'] ){
        return 2
      }else{
        return 1
      }
    }else{
      return 0
    }
  }

  chgMarca( marca ){
    this.params['marca'] = marca
  }

  chgPais( pais ){
    this.params['pais'] = pais
  }

  chgVenta( venta ){
    this.params['soloVenta'] = venta
  }

  chgMonth( m ){
    this.monthSelected = m
    this.dateStart = moment(`${moment().format(`YYYY${m}`)}-01`).format('YYYY-MM-DD')
    this.dateEnd = moment(`${moment(moment(`${moment().format(`YYYY${m}`)}-01`)).add(35, 'days').format('YYYY-MM')}-01`).subtract(1, 'days').format('YYYY-MM-DD')
    this.buildDates()
    this.params['start'] = this.dateStart
    this.params['end'] = this.dateEnd
    this.getData()
  }

  timerLoad(){
    if( this.timerCount == 0 ){
      this.getData()
      this.timerCount = this.timeToReload
    }else{
      this.timerCount--
    }

    this.timeout = setTimeout( () => this.timerLoad(), 1000 )

  }


}

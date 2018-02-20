import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-monitor-pausas',
  templateUrl: './monitor-pausas.component.html',
  styles: []
})
export class MonitorPausasComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'monitor_gtr'

  loading:Object = {}

  dataPausas:any
  sorted:any = []
  sortBy:any = 'nombre'
  pauseTypes:any
  dateSelected:any

  flag:Object = { default: true }

  dateMonitor:any
  dateMonRaw:Object = {
    year: '',
    month: '',
    day: ''
  }
  searchFilter:any = ''

  timerFlag:boolean = false
  timeCount:any = 120
  lu:any

  constructor(public _api: ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager, vcr: ViewContainerRef) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery("#loginModal").modal('show');
          }
        })

    this.dateMonitor = moment().format('YYYY-MM-DD')

    this.dateMonRaw = {
      year: parseInt(moment().format('YYYY')),
      month: parseInt(moment().format('MM')),
      day: parseInt(moment().format('DD'))
    }

    this.getPauses( this.dateMonitor )
    this.getTipos()
    this.timerLoad()

  }

  ngOnInit() {
  }

  run(){
      this.dateMonitor = moment(`${this.dateMonRaw['year']}-${this.dateMonRaw['month']}-${this.dateMonRaw['day']}`).format('YYYY-MM-DD')
      this.getPauses( this.dateMonitor )
  }

  getPauses( date ){
    this.timerFlag = false
    this.loading['Pauses'] = true

    this._api.restfulGet( date, 'Pausemon/pauseMon' )
              .subscribe( res => {

                this.loading['Pauses'] = false

                let data = res.data['data']
                this.lu = res.data['lu']
                let result = this.processPauses(data)

                this.dataPausas = result
                this.orderBy( 'nombre', true )

                this.timeCount = 120
                this.timerFlag = true

              }, err => {
                console.log("ERROR", err)

                this.timeCount = 30
                this.timerFlag = true

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['Pauses'] = false
              })


  }

  processPauses( data ){
    let result = {}

    for( let pause of data ){
      if( pause.Departamento != 'PDV' && pause.Departamento != null ){
        if( result[pause.asesor] ){
          result[pause.asesor]['pausas'].push(pause)
          result[pause.asesor]['sum'] = this.sumTimes( pause, result[pause.asesor]['sum'] )
          result[pause.asesor]['over'] = this.checkOver( pause, result[pause.asesor]['over'] )
          result[pause.asesor]['toReview'] = this.needsReview( pause, result[pause.asesor]['toReview'] )
        }else{
          result[pause.asesor] = {
            pausas: [pause],
            toReview: this.needsReview( pause ),
            sum: this.sumTimes( pause ),
            over: this.checkOver( pause ),
            nombre: pause.Nombre,
            Departamento: pause.Departamento
            }
        }
      }
    }

    return result
  }

  getTipos(){
    this._api.restfulGet( '', 'Pausemon/pauseTypes' )
              .subscribe( res => {

                this.pauseTypes = res.data

              }, err => {
                console.log("ERROR", err)

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loading['Pauses'] = false
              })
  }

  sumTimes( data, existent? ){

      let parameter
      let result = {
        aplicado: {
          acw: 0,
          pnp: 0,
          comida: 0,
          mesa: 0,
          charla: 0
        },
        justificado:{
          acw: 0,
          pnp: 0,
          comida: 0,
          mesa: 0,
          charla: 0
        }

      }

      switch( parseInt(data['tipo']) ){
        case 0:
        case 10:
          parameter = 'acw'
          break
        case 1:
        case 2:
        case 11:
          parameter = 'pnp'
          break
        case 4:
          parameter = 'mesa'
          break
        case 5:
        case 6:
        case 7:
          parameter = 'charla'
          break
        case 3:
          parameter = 'comida'
          break
      }

      if( existent ){
        if( parseInt(data['status']) == 1 ){
          existent['justificado'][parameter] += parseInt(data['dur_seconds'])
        }else{
          existent['aplicado'][parameter] += parseInt(data['dur_seconds'])
        }

        return existent
      }else{
        if( parseInt(data['status']) == 1 ){
          result['justificado'][parameter] = parseInt(data['dur_seconds'])
        }else{
          result['aplicado'][parameter] = parseInt(data['dur_seconds'])
        }

        return result
      }

  }

  checkOver( data, existent? ){

      let parameter
      let result = {
          acw: 0,
          pnp: 0,
          comida: 0,
          mesa: 0,
          charla: 0
      }
      let reference = {
        'pnp'         : 360,
        'acw'         : 180,
        'comida'      : 1860,
        'mesa'        : 2700,
        'charla'      : 900
      }

      switch( parseInt(data['tipo']) ){
        case 0:
        case 10:
          parameter = 'acw'
          break
        case 1:
        case 2:
        case 11:
          parameter = 'pnp'
          break
        case 4:
          parameter = 'mesa'
          break
        case 5:
        case 6:
        case 7:
          parameter = 'charla'
          break
        case 3:
          parameter = 'comida'
          break
      }

      if( existent ){
        if( parseInt(data['status']) != 1 ){
          if( parseInt(data['dur_seconds']) >= reference[parameter] ){
            existent[parameter] ++
          }
        }
        return existent

      }else{
        if( parseInt(data['status']) != 1 ){
          if( parseInt(data['dur_seconds']) >= reference[parameter] ){
            result[parameter] ++
          }
        }

        return result
      }

  }

  needsReview( data, existent? ){

      let parameter, result = 0
      let reference = {
        'pnp'         : 360,
        'acw'         : 180,
        'comida'      : 1860,
        'mesa'        : 2700,
        // 'charla'      : 900
        'charla'      : 100000900 // No incluye review
      }

      switch( parseInt(data['tipo']) ){
        case 0:
        case 10:
          parameter = 'acw'
          break
        case 1:
        case 2:
        case 11:
          parameter = 'pnp'
          break
        case 4:
          parameter = 'mesa'
          break
        case 5:
        case 6:
        case 7:
          parameter = 'charla'
          break
        case 3:
          parameter = 'comida'
          break
      }

      if( existent ){
        result = existent
      }

      if( data['status'] == null ){
        if( parseInt(data['dur_seconds']) >= reference[parameter] ){
          return result + 1
        }else{
          return result + 0
        }
      }else{
        return result
      }

  }

  getError( err ){
    let error = err.json()
    this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
  }

  setTimer( event ){
    this.flag[event['asesor']]=event['flag']
  }

  changePause( event ){
    this.timerFlag = false

    this.dataPausas[event.asesor]['loading'] = true

    this._api.restfulGet( `${event.date}/${event.asesor}`, 'Pausemon/pauseMon' )
              .subscribe( res => {

                this.timerFlag = true
                this.dataPausas[event.asesor]['loading'] = false

                let data = res.data['data']
                let result = this.processPauses(data)

                this.dataPausas[event.asesor] = result[event.asesor]

              }, err => {
                console.log("ERROR", err)

                this.timerFlag = true

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.dataPausas[event.asesor]['loading'] = false
              })


  }

  orderBy( field, order ){

    let sorted = [];
    this.sorted = [];

    for (let asesor in this.dataPausas) {
        let ar = {
          asesor: asesor,
          nombre: this.dataPausas[asesor]['nombre'],
          review: this.dataPausas[asesor]['toReview'],
          number: this.dataPausas[asesor]['pausas'].length,
          pnp: this.dataPausas[asesor]['sum']['aplicado']['pnp'],
          charla: this.dataPausas[asesor]['sum']['aplicado']['pnp'],
          acw: this.dataPausas[asesor]['sum']['aplicado']['pnp'],
          mesa: this.dataPausas[asesor]['sum']['aplicado']['pnp'],
          comida: this.dataPausas[asesor]['sum']['aplicado']['pnp']
        }
        sorted.push( ar );
    }

      if( field )
      sorted.sort(function(a, b) {
          if( order ){
            if( field == 'nombre' || field == 'Departamento'){
              let x = a[field].toLowerCase();
              let y = b[field].toLowerCase();
              if (x < y) {return -1;}
              if (x > y) {return 1;}
              return 0;
            }else{
              return a[field] - b[field];
            }

          }else{
            if( field == 'nombre' || field == 'Departamento'){
              let x = b[field].toLowerCase();
              let y = a[field].toLowerCase();
              if (x < y) {return -1;}
              if (x > y) {return 1;}
              return 0;
            }else{
              return b[field] - a[field];
            }
          }

      });


      for(let element of sorted){
        this.sorted.push(element)
      }

    }

  sortByField( field ){
    let flag = true

    if( field == this.sortBy ){
      flag = false
    }else{
      this.sortBy = field
    }

    this.orderBy( field, flag )
  }

  timerLoad( pause = false ){

    if( this.timerFlag ){
      if( this.timeCount == 0 ){

        this.getPauses( this.dateMonitor )

      }else{
        if( this.timeCount > 0){
          this.timeCount--
          setTimeout( () => {
          this.timerLoad()
          }, 1000 )
        }
      }
    }else{
      if( pause ){
        setTimeout( () => {
        this.timerLoad( true )
        }, 1000 )
      }
    }
  }

  formatTime( time, format ){
    let show = moment.tz(time, 'America/Mexico_city')
    show.tz('America/Bogota')

    return( show.format( format ) )
  }

}

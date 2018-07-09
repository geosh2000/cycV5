import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { ContextMenuComponent } from 'ngx-contextmenu';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { NgForm } from '@angular/forms';
import { JSONP_ERR_NO_CALLBACK } from '@angular/common/http/src/jsonp';

@Component({
  selector: 'app-programacion',
  templateUrl: './programacion.component.html',
  styles: []
})
export class ProgramacionComponent implements OnInit {

  hourOcc: Object = {}
  hourTemplate: Object = {}
  hourIndex: any = []
  hourTotal: Object = {}
  date:any = '2018-07-02'
  dataProg:any

  loading: Object = {}
  programacion:any

  grafWindow:any

  constructor( private _api:ApiService, private toastr:ToastrService ) {
    let tmp = []
    for( let i = 0; i < 24; i += .5 ){
      this.hourTemplate[i] = 0
      if( i < 6 ){
        tmp.push( { index: i, time: moment(`${this.date} ${ i < 10 ? '0' : '' }${Math.floor(i)}:${ i % Math.floor(i) == 0 ? '00' : '30' }`).add(1,'days').format('YYYY-MM-DD HH:mm:ss')} )
      }else{
        this.hourIndex.push( { index: i, time: moment(`${this.date} ${ i < 10 ? '0' : '' }${Math.floor(i)}:${ i % Math.floor(i) == 0 ? '00' : '30' }`).format('YYYY-MM-DD HH:mm:ss')} )
      }
    }

    for( let item of tmp ){
      this.hourIndex.push( item )
    }
  }

  ngOnInit() {
    this.getAsistencia( 35, this.date )

    // this.grafWindow = window.open('someurl_here');
  }

  getAsistencia( dep, inicio ){

      this.loading['prog'] = true

      let params = `${dep}/${inicio}/${inicio}/0/1/1`

      this._api.restfulGet( params, 'Asistencia/pyaV2' )
              .subscribe( res =>{

                this.programacion = res['data']
                this.buildOcc( res['data'] )

              },
                (err) => {
                  let error = err
                  this.loading['prog'] = false
                  this.toastr.error(`${ error }`, 'Error!');
              });


  }

  buildOcc( asist ){
    let dataProg = {}
    this.hourOcc = {}
    this.hourTotal = JSON.parse(JSON.stringify(this.hourTemplate))
    // tslint:disable-next-line:forin
    for( let asesor in asist ){
      this.hourOcc[asesor] = JSON.parse(JSON.stringify(this.hourTemplate))

      if( asist[asesor]['data'][this.date] ){
        let tmp = asist[asesor]['data'][this.date]
        dataProg[asesor] = { Nombre: asist[asesor]['Nombre'], js: tmp.js, je: tmp.je, x1s: tmp.x1s, x1e: tmp.x1e, x2s: tmp.x2s, x2e: tmp.x2e, cs: tmp.cs, ce: tmp.ce }

        this.getBeet( asist[asesor]['data'][this.date]['js'], asist[asesor]['data'][this.date]['je'], asesor, 'j' )
        this.getBeet( asist[asesor]['data'][this.date]['x1s'], asist[asesor]['data'][this.date]['x1e'], asesor, 'x1' )
        this.getBeet( asist[asesor]['data'][this.date]['x2s'], asist[asesor]['data'][this.date]['x2e'], asesor, 'x2' )
        this.getBeet( asist[asesor]['data'][this.date]['cs'], asist[asesor]['data'][this.date]['ce'], asesor, 'c' )
      }

    }

    this.dataProg = dataProg
  }

  getBeet( s, e, asesor, type ){
    let inicio = moment(s)
    let fin = moment(e)
    let min, max, i = 0
    for( let index of this.hourIndex ){
      if( moment(index.time) >= inicio && moment(index.time) < fin ){
        min = !min ? i : min
        max = i
      }

      i++
    }

    let rT, rF

    switch(type){
      case 'j':
        rT = 1
        rF = 0
        break
      case 'x1':
        rT = 2
        break
      case 'x2':
        rT = 3
        break
      case 'c':
        rT = 4
        break
    }

    for( i = 0; i < 48; i++){
      if( i >= min && i <= max ){
        this.hourOcc[asesor][this.hourIndex[i]['index']] = rT
        this.hourTotal[this.hourIndex[i]['index']] += type == 'c' ? -1 : 1
      }else{
        if( type == 'j' ){
          this.hourOcc[asesor][this.hourIndex[i]['index']] = rF
        }
      }
    }

    return [min, max]
  }

  printOcc(asesor, index, classFlag = false ){
    switch( this.hourOcc[asesor][index] ){
      case 1:
        return classFlag ? 'bg-success text-light' : 1
      case 2:
        return classFlag ? 'bg-warning text-light' : 1
      case 3:
        return classFlag ? 'bg-warning text-light' : 1
      case 4:
        return classFlag ? 'bg-danger text-light' : 0
    }
  }

  printDate( a, b, jornada = false ){
    if( a == b ){
      return jornada ? 'Descanso' : 'NA'
    }

    if( !a || !b ){
      return 'N/A'
    }

    return `${ moment(a).format('HH:mm') } - ${ moment(b).format('HH:mm') }`
  }
}

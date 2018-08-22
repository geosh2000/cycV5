import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { NgForm } from '@angular/forms';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'YYYY/MM/DD',
    dateA11yLabel: 'YYYY/MM/DD',
    monthYearA11yLabel: 'YYYY/MM/DD',
  },
};

@Component({
  selector: 'app-cambio-turno',
  templateUrl: './cambio-turno.component.html',
  styles: [`
    .inputTime{
      width: 70px;
    }

    md-datepicker.md-indigo-pink-theme {
      background: magenta;
    }
  `],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}]

})
export class CambioTurnoComponent implements OnInit {

  mainCredential: any = 'sch'
  showContents: boolean;
  currentUser: any;

  loading:Object = {}

  depCambio:any = 1000
  tipoCambioSel:any = null
  asesorHistoric:any = 'asesorA'

  form:Object = {
    dateA: '',
    dateB: '',
    asesorA: '',
    nombreA: '',
    asesorB: '',
    nombreB: '',
    tipoCambio: '',
    caso: ''
  }

  formulario:any

  originalData:Object = {
    a: {},
    b: {},
    c: {},
    d: {}
  }

  newData:Object = {
    a: {},
    b: {},
    c: {},
    d: {}
  }

  historic:Object = {
    asesorA: [],
    asesorB: []
  }

  constructor(
    private _api:ApiService,
    public _init:InitService,
    private titleService: Title,
    private _tokenCheck:TokenCheckService,
    public toastr: ToastrService,
    private _zh:ZonaHorariaService
    ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
              .subscribe( res => {

                if( res.status ){
                  this.showContents = this._init.checkCredential( this.mainCredential, true )
                }else{
                  this.showContents = false
                }
              })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Cambios de Turno');
  }

  onSelectedA( event ){
    let bEl = jQuery('#tComplete').find('input')
    jQuery(bEl[0]).val('')

    this.form['asesorA'] = event.asesor
    this.form['nombreA'] = event.Nombre
    this.form['asesorB'] = null
    this.depCambio = event.hc_dep
  }

  onSelectedB( event ){
    this.form['asesorB'] = event.asesor
    this.form['nombreB'] = event.Nombre
  }

  cambioSelection( val, formulario ){
    this.form['tipoCambio'] = parseInt(val)

    this.originalData = {a: {},b: {},c: {},d: {} }
    this.newData = {a: {},b: {},c: {},d: {} }

  }

  getOriginals(){
    this.loading['originals'] = true

    if( this.form['tipoCambio'] < 3 ){
      this.form['dateB'] = null
    }

    this.originalData = {a: {},b: {},c: {},d: {} }
    this.newData = {a: {},b: {},c: {},d: {} }

    this._api.restfulPut( this.form, 'Asistencia/originalScheds' )
              .subscribe( res => {

                this.loading['originals'] = false
                this.historic = {
                  'asesorA': [],
                  'asesorB': []
                }

                for( let item of res['historic']){
                  if(parseInt(item['asesor']) == parseInt(this.form['asesorA'])){
                    this.historic['asesorA'].push( item )
                  }else{
                    this.historic['asesorB'].push( item )
                  }
                }

                for( let item of res['data'] ){

                  // tslint:disable-next-line:forin
                  for( let field in item ){
                    switch(field){
                      case 'js':
                      case 'je':
                      case 'x1s':
                      case 'x1e':
                      case 'x2s':
                      case 'x2e':
                      case 'cs':
                      case 'ce':
                        item[field] = item[field] ? moment(item[field]).format('HH:mm') : null
                    }
                  }
                  if( item['asesor'] == this.form['asesorA'] ){
                    if( this.originalData['a']['Fecha'] ){
                      this.originalData['b'] = item
                      this.newData['d'] = item
                      this.newData['d']['asesor'] = this.form['asesorB']
                      // this.newData['d']['Fecha'] = this.form['tipoCambio'] >= 3 ? this.form['dateA'] : this.form['dateA']
                    }else{
                      this.originalData['a'] = item
                      this.newData['c'] = item
                      this.newData['c']['asesor'] = this.form['asesorB']
                      // this.newData['d']['Fecha'] = this.form['tipoCambio'] >= 3 ? this.form['dateA'] : this.form['dateA']
                    }
                  }else{
                    if( this.originalData['c']['Fecha'] ){
                      this.originalData['d'] = item
                      this.newData['b'] = item
                      this.newData['b']['asesor'] = this.form['asesorA']
                      // this.newData['b']['Fecha'] = this.form['tipoCambio'] >= 3 ? this.form['dateA'] : this.form['dateA']
                    }else{
                      this.originalData['c'] = item
                      this.newData['a'] = item
                      this.newData['a']['asesor'] = this.form['asesorA']
                      // this.newData['a']['Fecha'] = this.form['tipoCambio'] >= 3 ? this.form['dateA'] : this.form['dateA']
                    }
                  }
                }

                // console.log(this.newData)

              }, err => {
                console.log('ERROR', err)

                this.loading['originals'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  dtChange( field, event ){
    this.form[field] = event.value.format('YYYY-MM-DD')
  }

  saveEdit( form: NgForm ){
    // console.log( form )
    this.formulario= form

    if ( form.valid ){

      if ( !this.validateHs( form.value ) ){
        return false
      }

      return true
    }else{
      this.toastr.error('El formulario es inválido', 'ERROR!')

      let ctrls = {
        a_js: ['Jornada Inicio', 'Jornada'],b_js: ['Jornada Inicio', 'Jornada'],c_js: ['Jornada Inicio', 'Jornada'],d_js: ['Jornada Inicio', 'Jornada'],
        a_je: ['Jornada Fin', 'Jornada'],b_je: ['Jornada Fin', 'Jornada'],c_je: ['Jornada Fin', 'Jornada'],d_je: ['Jornada Fin', 'Jornada'],
        a_x1s: ['Horas Extra 1 Inicio', 'x1'],b_x1s: ['Horas Extra 1 Inicio', 'x1'],c_x1s: ['Horas Extra 1 Inicio', 'x1'],d_x1s: ['Horas Extra 1 Inicio', 'x1'],
        a_x1e: ['Horas Extra 1 Fin', 'x1'],b_x1e: ['Horas Extra 1 Fin', 'x1'],c_x1e: ['Horas Extra 1 Fin', 'x1'],d_x1e: ['Horas Extra 1 Fin', 'x1'],
        a_x2s: ['Horas Extra 2 Inicio', 'x2'],b_x2s: ['Horas Extra 2 Inicio', 'x2'],c_x2s: ['Horas Extra 2 Inicio', 'x2'],d_x2s: ['Horas Extra 2 Inicio', 'x2'],
        a_x2e: ['Horas Extra 2 Fin', 'x2'],b_x2e: ['Horas Extra 2 Fin', 'x2'],c_x2e: ['Horas Extra 2 Fin', 'x2'],d_x2e: ['Horas Extra 2 Fin', 'x2'],
        a_cs: ['Comida Inicio', 'Comida'],b_cs: ['Comida Inicio', 'Comida'],c_cs: ['Comida Inicio', 'Comida'],d_cs: ['Comida Inicio', 'Comida'],
        a_ce: ['Comida Fin', 'Comida'],b_ce: ['Comida Fin', 'Comida'],c_ce: ['Comida Fin', 'Comida'],d_ce: ['Comida Fin', 'Comida'],
      }

      // tslint:disable-next-line:forin
      for( let ctrl in form.controls ){
        if( !form.controls[ctrl]['valid'] ){
          // tslint:disable-next-line:forin
          for( let err in form.controls[ctrl]['errors'] ){
            let msg
            switch( err ){
              case 'required':
                msg = 'Debes ingresar horarios de inicio y fin'
                break
              case 'pattern':
                msg = 'Debes ingresar el horario en forma HH:MM en formato de 24 hrs (sólo se aceptan minutos en \'00\' y \'30\''
                break
            }

            this.toastr.error(msg, `Error en ${ctrls[ctrl][0]}`)
          }
        }
      }
    }

  }

  validateHs( value ){
    let forms = ['a_', 'b_', 'c_', 'd_']
    let result = []

    if( (this.form['tipoCambio'] == 2 || this.form['tipoCambio'] == 4) && (!this.form['caso'] || this.form['caso'] == '') ){
      this.toastr.error('Debes ingresar un número de caso para cambios de turno o descanso', 'Error en Caso')
      return false
    }

    for( let pfx of forms ){
      if( this.newData[ pfx.substr(0,1) ]['Fecha'] ){
        let max, i, e
        let vals = {
          j: {},
          x1: {},
          x2: {},
          c: {},
        }, r = { js: null, je: null, x1s: null, x1e: null, x2s:null, x2e: null, cs:null, ce: null, asesor: this.newData[ pfx.substr(0,1) ]['asesor'], Fecha: this.newData[ pfx.substr(0,1) ]['Fecha'] }


        // Jornadas
        i = value[pfx + 'i']
        e = value[pfx + 'e']
        vals['j']['start'] = moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`)
        vals['j']['end'] = moment(`${ moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`) ? moment(this.newData[ pfx.substr(0,1) ]['Fecha']).add(1,'days').format('YYYY-MM-DD') : moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`)
        vals['j']['duration'] = moment.duration(vals['j']['end'].diff(vals['j']['start'])).asHours();
        max = 12
        this.checkLenHs( vals['j']['start'], vals['j']['end'], vals['j']['duration'], max, 'Jornadas')

        if( (value[pfx + 'i'] == value[pfx + 'e'] && value[pfx + 'i'] != '00:00') || value[pfx + 'i'] == null || value[pfx + 'e'] == null || value[pfx + 'i'] == '' || value[pfx + 'e'] == '' ){
          this.toastr.error(`Para cargar horas extra o comidas, debes ingresar una jornada. Si deseas asignar un descanso, puedes hacerlo desde el menú rápido`, 'Error en Jornadas')
          return false
        }

        r['js'] = vals['j']['start'].format('YYYY-MM-DD HH:mm:ss')
        r['je'] = vals['j']['end'].format('YYYY-MM-DD HH:mm:ss')

        if(!( value[pfx + 'x1i'] == null || value[pfx + 'x1e'] == null || value[pfx + 'x1i'] == '' || value[pfx + 'x1e'] == '' )){
          // X1
          i = value[pfx + 'x1i']
          e = value[pfx + 'x1e']
          vals['x1']['start'] = moment(`${moment(`${i}:00`) < moment('03:00:00') ? moment(this.newData[ pfx.substr(0,1) ]['Fecha']).add(1, 'days').format('YYYY-MM-DD') : moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`)
          vals['x1']['end'] = moment(`${ moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`) ? moment(this.newData[ pfx.substr(0,1) ]['Fecha']).add(1,'days').format('YYYY-MM-DD') : moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`)
          vals['x1']['duration'] = moment.duration(vals['x1']['end'].diff(vals['x1']['start'])).asHours();
          max = 2
          this.checkLenHs( vals['x1']['start'], vals['x1']['end'], vals['x1']['duration'], max, 'X1')
          if( vals['x1']['start'] > vals['j']['start'] && vals['x1']['start'] < vals['j']['end'] ){
            this.toastr.error(`Las horas extra no pueden iniciar entre los horarios de jornada`, 'Error en Extra 1')
            return false
          }
          if( vals['x1']['end'] > vals['j']['start'] && vals['x1']['end'] < vals['j']['end'] ){
            this.toastr.error(`Las horas extra no pueden terminar entre los horarios de jornada`, 'Error en Extra 1')
            return false
          }

          r['x1s'] = vals['x1']['start'].format('YYYY-MM-DD HH:mm:ss')
          r['x1e'] = vals['x1']['end'].format('YYYY-MM-DD HH:mm:ss')
        }

        if(!( value[pfx + 'x2i'] == null || value[pfx + 'x2e'] == null || value[pfx + 'x2i'] == '' || value[pfx + 'x2e'] == '' )){
          // X2
          i = value[pfx + 'x2i']
          e = value[pfx + 'x2e']
          vals['x2']['start'] = moment(`${moment(`${i}:00`) < moment('03:00:00') ? moment(this.newData[ pfx.substr(0,1) ]['Fecha']).add(1, 'days').format('YYYY-MM-DD') : moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`)
          vals['x2']['end'] = moment(`${ moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`) ? moment(this.newData[ pfx.substr(0,1) ]['Fecha']).add(1,'days').format('YYYY-MM-DD') : moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`)
          vals['x2']['duration'] = moment.duration(vals['x2']['end'].diff(vals['x2']['start'])).asHours();
          max = 2
          this.checkLenHs( vals['x1']['start'], vals['x1']['end'], vals['x1']['duration'], max, 'X1')
          if( value[pfx + 'x1s'] == value[pfx + 'x1e'] || value[pfx + 'x1s'] == null || value[pfx + 'x1e'] == null || value[pfx + 'x1s'] == '' || value[pfx + 'x1e'] == '' ){
            this.toastr.error(`No es posible cargar horas extra en el slot 2 si el slot \'x1\' está vacío`, 'Error en X2')
            return false
          }
          if( vals['x2']['start'] > vals['j']['start'] && vals['x2']['start'] < vals['j']['end'] ){
            this.toastr.error(`Las horas extra no pueden iniciar entre los horarios de jornada`, 'Error en Extra 2')
            return false
          }
          if( vals['x2']['end'] > vals['j']['start'] && vals['x2']['end'] < vals['j']['end'] ){
            this.toastr.error(`Las horas extra no pueden terminar entre los horarios de jornada`, 'Error en Extra 2')
            return false
          }
          if( vals['x2']['start'] > vals['x1']['start'] && vals['x2']['start'] < vals['x1']['end'] ){
            this.toastr.error(`Las horas extra del slot 2 no pueden iniciar entre los horarios de las horas extra del slot 1`, 'Error en Extra 2')
            return false
          }
          if( vals['x2']['end'] > vals['x1']['start'] && vals['x2']['end'] < vals['x1']['end'] ){
            this.toastr.error(`Las horas extra del slot 2 no pueden terminar entre los horarios de las horas extra del slot 1`, 'Error en Extra 2')
            return false
          }

          r['x2s'] = vals['x2']['start'].format('YYYY-MM-DD HH:mm:ss')
          r['x2e'] = vals['x2']['end'].format('YYYY-MM-DD HH:mm:ss')
        }

        if(!( value[pfx + 'ci'] == null || value[pfx + 'ce'] == null || value[pfx + 'ci'] == '' || value[pfx + 'ce'] == '' )){
          // Comidas
          i = value[pfx + 'ci']
          e = value[pfx + 'ce']
          vals['c']['start'] = moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`)
          vals['c']['end'] = moment(`${ moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`) ? moment(this.newData[ pfx.substr(0,1) ]['Fecha']).add(1,'days').format('YYYY-MM-DD') : moment(this.newData[ pfx.substr(0,1) ]['Fecha']).format('YYYY-MM-DD')} ${e}:00`)
          vals['c']['duration'] = moment.duration(vals['c']['end'].diff(vals['c']['start'])).asHours();
          max = 1
          this.checkLenHs( vals['c']['start'], vals['c']['end'], vals['c']['duration'], max, 'Comidas')
          if( vals['c']['start'] < vals['j']['start'] || vals['c']['start'] > vals['j']['end'] ){
            this.toastr.error(`El horario de comida debe estar dentro de los horarios de jornada`, 'Error en Extra 2')
            return false
          }
          if( vals['c']['start'] < vals['j']['start'] || vals['c']['end'] > vals['j']['end'] ){
            this.toastr.error(`El horario de comida debe estar dentro de los horarios de jornada`, 'Error en Extra 2')
            return false
          }

          r['cs'] = vals['c']['start'].format('YYYY-MM-DD HH:mm:ss')
          r['ce'] = vals['c']['end'].format('YYYY-MM-DD HH:mm:ss')
        }

        result.push(r)
      }
    }

    console.log(result)

    if( result.length > 0){
      this.uploadChanges( result, 'save')
    }else{
      this.toastr.error(`No existen horarios para guardar`, 'Error en Formulario')
      return false
    }

  }

  checkLenHs( start, end, duration, max, ctrl ){
    if( start == end ){
      this.toastr.error(`No es posible ingresar dos valores idénticos. Si necesitas ingresar un descanso, puedes hacerlo desde el menú rápido`, 'Error en ' + ctrl)
      return false
    }

    if (duration > max) {
      this.toastr.error(`El horario de fin es menor al de inicio, o existe una diferencia mayor a ${max} horas entre horarios`, 'Error en ' + ctrl)
      return false
    }

    return true
  }

  uploadChanges( changes, loader ){

    // console.log(changes)
    this.loading[loader] = true

    this._api.restfulPut( changes, `Asistencia/schedulesChargeSave/1/${this.form['tipoCambio']}/${this.form['caso']}` )
              .subscribe( res => {

                this.loading[loader] = false
                this.toastr.success(res['msg'], 'Guardado' )
                this.formulario.resetForm()
                this.resetInit()

              }, err => {
                console.log('ERROR', err)

                this.loading[loader] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  resetInit(){
    this.originalData = {a: {},b: {},c: {},d: {} }
    this.newData = {a: {},b: {},c: {},d: {} }

    let bEl = jQuery('#tComplete').find('input')
    let pEl = jQuery('#pComplete').find('input')
    jQuery(bEl[0]).val('')
    jQuery(pEl[0]).val('')

    this.form = { dateA: '', dateB: '', asesorA: '', nombreA: '', asesorB: '', nombreB: '', tipoCambio: '', caso: '' }
    this.depCambio = 0
    this.tipoCambioSel = null

  }

}

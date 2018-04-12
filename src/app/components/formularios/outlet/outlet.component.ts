import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Title } from '@angular/platform-browser';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styles: []
})
export class OutletComponent implements OnInit {

  showContents:boolean = false
  mainCredential:string = 'default'
  currentUser:any

  confirmation:Object = {}

  loading:Object = {}
  form:Object = {
    destino: {}
  }
  slots:any = [1,2,3,4,5,6,7,8,9,10]
  horas:any = [
    '10:00:00','10:30:00','11:00:00','11:30:00','12:00:00','12:30:00','13:00:00','13:30:00','14:00:00',
    '14:30:00','15:00:00','16:00:00','17:00:00','18:00:00','19:00:00','20:00:00'
  ]

  slotsBusy:Object = {}

  validation:Object = {}
  valid:boolean = false

  timerLoad:number = 15
  timeToLoad:number = 15

  constructor(
                private _api:ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager,
                public vcr: ViewContainerRef
                ) {

    this.toastr.setRootViewContainerRef(vcr)
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
    this.titleService.setTitle('CyC - Citas Outlet 2018');
    this.slotsGet()
    this.timer()
  }

  reset(){
    this.form = {
      destino: {}
    }
    this.valid = false
    this.validation = {}
    this.slotsGet()
  }

  select(tipo, val){
    let index:any

    switch(tipo){
      case 'fecha':
        if( this.form['fecha'] ){
          this.form['hora'] = ''
          this.form['espacio'] = ''
        }
        this.form['fecha'] = this.form['fecha'] == val ? '' : val

        break
      case 'producto':
        if( this.form['producto'] ){
          index = this.form['producto'].indexOf(val)
          if( index < 0 ){
            this.form['producto'].push(val)
          }else{
            this.form['producto'].splice(index, 1);
          }

          this.form['producto'].sort()

        }else{
          this.form['producto'] = [val]
        }
        break
      case 'destino':
        if( this.form['destino']['tipo'] ){
          index = this.form['destino']['tipo'].indexOf(val)
          if( index < 0 ){
            this.form['destino']['tipo'].push(val)
          }else{
            this.form['destino']['tipo'].splice(index, 1);
          }
          this.form['destino']['tipo'].sort()
        }else{
          this.form['destino']['tipo'] = [val]
        }
        break
      case 'espacio':
        let slot = this.form['espacio']
        let hora = this.form['hora']
        this.form['hora']     = hora == val[1] ? (slot == val[0] ? '' : val[1]) : val[1]
        this.form['espacio']  = slot == val[0] ? (hora == val[1] ? '' : val[0]) : val[0]
        break
    }

    this.validate(tipo)
  }

  validate( field='all' ){
    field == 'all' || field == 'name' ? ( this.validation['name'] = (this.form['name'] && this.form['name'] != '') ? true : false ) : false
    field == 'all' || field == 'correo' ? ( this.validation['correo'] = (this.form['correo'] && this.form['correo'] != '') ? true : false ) : false
    field == 'all' || field == 'localizador' ? ( this.validation['localizador'] = (this.form['localizador'] && this.form['localizador'] != '') ? true : false ) : false
    field == 'all' || field == 'telefono' ? ( this.validation['telefono'] = (this.form['telefono'] && this.form['telefono'] != '') ? true : false ) : false
    field == 'all' || field == 'fecha' ? ( this.validation['fecha'] = (this.form['fecha'] && this.form['fecha'] != '') ? true : false ) : false
    field == 'all' || field == 'hora' ? ( this.validation['hora'] = (this.form['hora'] && this.form['hora'] != '') ? true : false ) : false
    field == 'all' || field == 'espacio' ? ( this.validation['espacio'] = (this.form['espacio'] && this.form['espacio'] != '') ? true : false ) : false
    field == 'all' || field == 'destination' ? ( this.validation['destination'] = (this.form['destino']['destino'] && this.form['destino']['destino'] != '') ? true : false ) : false
    field == 'all' || field == 'destino' ? ( this.validation['destino'] = (this.form['destino']['tipo'] && this.form['destino']['tipo'].length > 0) ? true : false ) : false
    field == 'all' || field == 'producto' ? ( this.validation['producto'] = (this.form['producto'] && this.form['producto'].length > 0) ? true : false ) : false

    field == 'all' || field == 'name' ? ( this.form['name'] = this.form['name'] ? this.form['name'] : '' ) : false
    field == 'all' || field == 'correo' ? ( this.form['correo'] = this.form['correo'] ? this.form['correo'] : '' ) : false
    field == 'all' || field == 'localizador' ? ( this.form['localizador'] = this.form['localizador'] ? this.form['localizador'] : '' ) : false
    field == 'all' || field == 'telefono' ? ( this.form['telefono'] = this.form['telefono'] ? this.form['telefono'] : '' ) : false
    field == 'all' || field == 'fecha' ? ( this.form['fecha'] = this.form['fecha'] ? this.form['fecha'] : '' ) : false
    field == 'all' || field == 'hora' ? ( this.form['hora'] = this.form['hora'] ? this.form['hora'] : '' ) : false
    field == 'all' || field == 'espacio' ? ( this.form['espacio'] = this.form['espacio'] ? this.form['espacio'] : '' ) : false
    field == 'all' || field == 'destination' ? ( this.form['destino']['destino'] = this.form['destino']['destino'] ? this.form['destino']['destino'] : '' ) : false
    field == 'all' || field == 'destino' ? ( this.form['destino']['tipo'] = this.form['destino']['tipo'] && this.form['destino']['tipo'].length > 0  ? this.form['destino']['tipo'] : [] ) : false
    field == 'all' || field == 'producto' ? ( this.form['producto'] = this.form['producto'] && this.form['producto'].length > 0  ? this.form['producto'] : [] ) : false

    if( field == 'all' ){
      let flag = true
      for( let field in this.validation ){
        if( !this.validation[field] ){
          flag = false
        }
      }

      this.valid = flag
    }
  }

  slotsGet(){
    this.loading['slots'] = true

    this._api.restfulGet( '', 'Outlet/slots' )
              .subscribe( res => {

                this.loading['slots'] = false
                this.slotsBusy = res.data

                if( this.form['fecha'] && this.form['fecha'] != '' ){
                  if( this.form['hora'] && this.form['hora'] != '' ){
                    if( this.form['espacio'] <= res.data[this.form['fecha']][this.form['hora']] ){
                      if( res.data[this.form['fecha']][this.form['hora']] >= 10 ){
                        this.toastr.error( `Los espacios para el ${ moment(this.form['fecha']).format('DD MMM')} a las ${moment(`${this.form['fecha']} ${this.form['hora']}`).format('HH:mm')} se han agotado. Por favor elige otro horario`, `Espacios Agotados` )
                        this.form['espacio'] = ''
                        this.form['hora'] = ''
                        this.validate('espacio')
                      }else{
                        this.form['espacio'] = parseInt(res.data[this.form['fecha']][this.form['hora']])+1
                      }
                    }
                  }
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['slots'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
  }

  timer(){
    if(this.timerLoad == 0){
      this.timerLoad = this.timeToLoad
      this.slotsGet()
      setTimeout(()=>this.timer(),1000)
    }else{
      this.timerLoad--
      setTimeout(()=>this.timer(),1000)
    }
  }

  formatTime(time, format){
    return moment(`2018-05-11 ${time}`).format(format)
  }

  save(){
    this.validate()

    if(this.valid){
      let params = {
        Nombre      : this.form['name'],
        Localizador : this.form['localizador'],
        correo      : this.form['correo'],
        telefono    : this.form['telefono'],
        producto    : this.form['producto'].join('|'),
        destino     : this.form['destino']['tipo'].join('|'),
        destination : this.form['destino']['destino'],
        Fecha       : this.form['fecha'],
        Hora        : this.form['hora']
      }

      this.loading['save'] = true

      this._api.restfulPut( params, 'Outlet/cita' )
              .subscribe( res => {

                this.loading['save'] = false
                this.confirmation = params
                this.confirmation['date'] = moment(`${params['Fecha']} ${params['Hora']}`).format('dddd DD MMM HH:mm')
                this.confirmation['folio'] = res.data
                jQuery('#confirmModal').modal('show')
                this.reset()

              }, err => {
                console.log("ERROR", err)

                this.loading['save'] = false

                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)

              })
    }
  }

}

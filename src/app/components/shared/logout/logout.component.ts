import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styles: []
})
export class LogoutComponent implements OnInit {

  @Output() confirm = new EventEmitter<any>()

  accept:boolean = false
  loading:Object = {}
  currentUser:any
  hData:any

  constructor(
                private _api:ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService
                ) {

    this.currentUser = this._init.getUserInfo()
    moment.locale('es-MX')

  }

  ngOnInit() {
    console.log(this.currentUser)
  }

  getHorarios( id ){
    this.loading['horarios'] = false

    let inicio = moment().add(1, 'days').format('YYYY-MM-DD')
    let fin = moment().add(2, 'days').format('YYYY-MM-DD')

    if( parseInt( moment().format('HH') ) < 8 ){
      inicio = moment().format('YYYY-MM-DD')
      fin = moment().add(1, 'days').format('YYYY-MM-DD')
    }

    this._api.restfulGet( `${id}/${inicio}/${fin}`, 'Asistencia/horarioAsesor' )
        .subscribe( res => {

          this.loading['horarios'] = false
          jQuery('#logOutModal').modal('show')
          this.hData = res['data']

        }, err => {
          console.log("ERROR", err)

          this.loading['horarios'] = false

          let error = err.json()
          this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
          console.error(err.statusText, error.msg)

        })
  }

  printDate( input, format ){
    return moment(input).format(format)
  }

  logout( id ){
    this.hData = []
    this.getHorarios( id )
  }

  confirmLO(){
    this.loading['lout'] = true

    let inicio = moment().format('YYYY-MM-DD')

    if( parseInt( moment().format('HH') ) < 8 ){
      inicio = moment().subtract(1, 'days').format('YYYY-MM-DD')
    }

    let params = {
      'Fecha' : inicio,
      asesor  : this.currentUser['hcInfo']['id'],
      'horario_aceptado'  : jQuery('#horario').html()
    }

    this._api.restfulPut( params, 'Login/logout' )
        .subscribe( res => {

          this.loading['lout'] = false
          jQuery('#logOutModal').modal('hide')
          localStorage.removeItem('currentUser');
          this.confirm.emit(true);

        }, err => {
          console.log("ERROR", err)

          this.loading['lout'] = false

          let error = err.json()
          this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
          console.error(err.statusText, error.msg)

        })
  }

}

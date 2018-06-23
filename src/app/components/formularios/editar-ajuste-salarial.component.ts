import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/service.index';

@Component({
  selector: 'app-editar-ajuste-salarial',
  templateUrl: './editar-ajuste-salarial.component.html',
  styles: []
})
export class EditarAjusteSalarialComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()

  ajuste:any
  asesor:any
  currentUser:any = {
    credentials: null
  }

  submitting:boolean = false
  accept:boolean = false
  cancel:boolean = false

  constructor(
              private _api:ApiService
              ) {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser != null){
      this.currentUser = currentUser
    }

  }

  ngOnInit() {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser != null){
      this.currentUser = currentUser
    }

  }

  buildForm( array ){
    this.asesor = array
    this.ajuste = array.solSalario['info']
    this.submitting = false
    this.accept = false
    this.cancel = false
  }

  approbe( flag ){

    this.accept = flag
    this.submitting = true

    let params = {
      accept: flag,
      id: this.ajuste.id,
      puesto: this.asesor.hc_puesto,
      applier: this.currentUser.hcInfo.id
    }

    // console.log(this.formCambioPuesto)
    this._api.restfulPut( params , 'SolicitudBC/approbeSalario' )
            .subscribe( res => {
              this.submitting = false
              if(res['status']){

                this.save.emit({form: "#form_editarAjusteSalarial", status: true})
              }else{
                console.error( res )
              }

            })

  }

  cxl( ){

    this.cancel = true
    this.submitting = true

    let params = {
      id: this.ajuste.id,
      applier: this.currentUser.hcInfo.id
    }

    // console.log(this.formCambioPuesto)
    this._api.restfulPut( params , 'SolicitudBC/cxlSalario' )
            .subscribe( res => {
              this.submitting = false
              if(res['status']){
          
                this.save.emit({form: "#form_editarAjusteSalarial", status: true})
              }else{
                console.error( res )
              }

            })

  }

}

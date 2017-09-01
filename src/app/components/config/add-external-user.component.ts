import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Observable } from 'rxjs/rx';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-add-external-user',
  templateUrl: './add-external-user.component.html',
  styles: []
})
export class AddExternalUserComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential='allmighty'

  listProfiles
  listProfileLoaded:boolean = false

  formExternalUser:FormGroup

  formExternalUserDetail:Object = {
    nombre:               { tipo: 'text',     icon: 'fa fa-user-circle-o fa-fw',      title: "Nombre(s)",     show: true,   readonly: false,  pattern: 'La primer letra de cada nombre debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada nombre'},
    apellido:             { tipo: 'text',     icon: 'fa fa-user-circle fa-fw',        title: "Apellido(s)",   show: true,   readonly: false,  pattern: 'La primer letra de cada apellido debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada apellido'},
    nombre_corto:         { tipo: 'text',     icon: 'fa fa-drivers-license-o fa-fw',  title: "Nombre Corto",  show: true,   readonly: false,  pattern: 'El formato debe ser con Mayúsculas y Minúsculas sin acentos<br>Sólo 1 Nombre y 1 Apellido<br>El formato debe coincidir con: "Nombre Apellido"'},
    profile:              { tipo: 'select',   icon: 'fa fa-product-hunt fa-fw',       title: "Profile",       show: true,   readonly: false,  pattern: ''},
    validation:           { tipo: 'select2',  icon: 'fa fa-key fa-fw',                title: "Validación",    show: true,   readonly: false,  pattern: ''}
  }

  listTipos = [
    {id: 0, name: 'Responsabilidad'}
  ]

  listStatus = [
    {id: 0, name: 'Registrar'}
  ]

  submitting:boolean = false

  currentUser:any

  saveAlert:boolean = false
  errorMsg:string = ""

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                private _api:ApiService,
                private _init:InitService
                ) {

      this.currentUser = this._init.getUserInfo()
      this.showContents = this._init.checkCredential( this.mainCredential, true )


    this.toastr.setRootViewContainerRef(vcr);

    this.populateProfiles()

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if(this.currentUser.credentials['cxc_apply'] == 1){
      this.listStatus.push({id: 1, name: 'Enviar a RRHH'})
      this.listTipos.push({id: 1, name: 'Colaborador'})
    }

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

    this.formExternalUser = new FormGroup({
      nombre:             new FormControl('', [ Validators.required,  Validators.pattern("^[A-ZÁÉÍÓÚ]{1}[a-záéíóú]+([ ]{1}[A-ZÁÉÍÓÚ]{1}[a-záéíóú]+){0,3}$") ] ),
      apellido:           new FormControl('', [ Validators.required,  Validators.pattern("^[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+([ ]{1}[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+|[ ]{1}[a-záéíóúñ]{2,3}){0,5}$") ] ),
      nombre_corto:       new FormControl('', [ Validators.required,  Validators.pattern("^[A-Z]{1}[a-z]* [A-Z]{1}[a-z]*$") ], this.userExists.bind(this) ),
      profile:            new FormControl('', [ Validators.required ] ),
      applier:            new FormControl(''),
      validation:         new FormControl('', [ Validators.required ] )
    })

  }

  ngOnInit() {
  }

  populateProfiles(){
    let params = {}
    this._api.postFromApi( params, 'listProfiles' )
            .subscribe( res => {
              this.listProfiles = res
              this.listProfileLoaded = true

            })
  }

  userExists( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this

    let promesa = new Promise(
      (resolve, reject) =>{

        let params = {
          user: control.value,
          asesor: 0
        }

        thisData._api.postFromApi( params, 'validateUserExists')
          .subscribe( res => {
            if(res){
              if(res.res == 1){
                resolve({existe: true})
              }else{
                resolve(null)
              }
            }
          })

      }
    )
    return promesa
  }

  //Validación Check
  checkChange( control: FormControl ): { [s:string]:boolean }{

    if( !control.dirty ){
      return {
        indeterminate: true
      }
    }else{
      return null
    }

  }

  setVal( val, control ){
    this.formExternalUser.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  buildForm( array ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.formExternalUser.controls['created_by'].setValue( currentUser.hcInfo['id'] )
    this.formExternalUser.controls['asesor'].setValue( array.idAsesor )
    this.formExternalUser.controls['status'].setValue( 0 )
  }

  submit(){
    this.submitting = true
    this._api.restfulPut( this.formExternalUser.value, "Config/addExternal" )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.toastr.success("Usuario guardado correctamente", 'Guardado!');
                this.formExternalUser.reset()

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                this.toastr.error(`code: ${res['msg'].code} error: ${res['msg'].message}`, 'Error!');
                console.error( res )
              }
            })
  }

}
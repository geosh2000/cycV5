import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Observable } from 'rxjs/rx';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styles: []
})
export class EditDetailsComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formDetail:FormGroup
  listProfiles
  listProfileLoaded:boolean = false

  submitting:boolean = false

  asesorDetails:Object = {
    id: null,
    num_colaborador: null,
    nombre: null,
    apellido: null,
    nombre_corto: null,
    profile: null,
    tel1: null,
    tel2: null,
    correo: null,
    pasaporte: null,
    visa: null,
    rfc: null,
    nacimiento: null
  }

  asesorDetailsForm:Object = {
    id: { tipo: 'text', icon: 'fa fa-address-card-o fa-fw', readonly: true, pattern: ''},
    num_colaborador: { tipo: 'text', icon: 'fa fa-address-book-o fa-fw', readonly: false, pattern: 'El número de colaborador está compuesto por 8 dígitos'},
    nombre: { tipo: 'text', icon: 'fa fa-user-circle-o fa-fw', readonly: false, pattern: 'La primer letra de cada nombre debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada nombre'},
    apellido: { tipo: 'text', icon: 'fa fa-user-circle fa-fw', readonly: false, pattern: 'La primer letra de cada apellido debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada apellido'},
    nombre_corto: { tipo: 'text', icon: 'fa fa-drivers-license-o fa-fw', readonly: false, pattern: 'El formato debe ser con Mayúsculas y Minúsculas sin acentos<br>Sólo 1 Nombre y 1 Apellido<br>El formato debe coincidir con: "Nombre Apellido"'},
    profile: { tipo: 'select', icon: 'fa fa-product-hunt fa-fw', readonly: false, pattern: ''},
    tel1: { tipo: 'text', icon: 'fa fa-phone fa-fw', readonly: false, pattern: '10 dígitos sin espacios ni símbolos'},
    tel2: { tipo: 'text', icon: 'fa fa-mobile fa-fw', readonly: false, pattern: '10 dígitos sin espacios ni símbolos'},
    correo: { tipo: 'text', icon: 'fa fa-envelope-o fa-fw', readonly: false, pattern: "El Formato no coincide con un correo correcto"},
    pasaporte: { tipo: 'date', icon: 'fa fa-suitcase fa-fw', readonly: false, pattern: ''},
    visa: { tipo: 'date', icon: 'fa fa-telegram fa-fw', readonly: false, pattern: ''},
    rfc: { tipo: 'text', icon: 'fa fa-address-book fa-fw', readonly: false, pattern: 'El RFC debe estar en mayúsculas<br>El Formato debe coincidir con AAAA######HHH'},
    nacimiento: { tipo: 'date', icon: 'fa fa-birthday-cake fa-fw', readonly: false, pattern: ''}
  }

  asesorDetailsQueryNames = {
    id: "id",
    num_colaborador: "num_colaborador",
    nombre: "Nombre_Separado",
    apellido: "Apellidos_Separado",
    nombre_corto: "`N Corto`",
    profile: "profile",
    tel1: "Telefono1",
    tel2: "Telefono2",
    correo: "correo_personal",
    pasaporte: "Vigencia_Pasaporte",
    visa: "Vigencia_Visa",
    rfc: "RFC",
    nacimiento: "Fecha_Nacimiento"
  }

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  constructor(
              private _dateRangeOptions: DaterangepickerConfig,
              private _api:ApiService,
              public toastr: ToastsManager, vcr: ViewContainerRef
              ) {

      this.toastr.setRootViewContainerRef(vcr);

      this.populateProfiles()

      this.formDetail = new FormGroup({
        id: new FormControl(this.asesorDetails['id'], [ Validators.required ] ),
        num_colaborador: new FormControl(this.asesorDetails['num_colaborador'], [ Validators.pattern("^[0-9]{8}$") ] ),
        nombre: new FormControl(this.asesorDetails['nombre'], [ Validators.required, Validators.pattern("^[A-ZÁÉÍÓÚ]{1}[a-záéíóú]+([ ]{1}([A-ZÁÉÍÓÚ]{1}[a-záéíóú]+|[d]{1}[e]{1}[l]{0,1})){0,3}$") ] ),
        apellido: new FormControl(this.asesorDetails['apellido'], [ Validators.required, Validators.pattern("^[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+([ ]{1}[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+|[ ]{1}[a-záéíóúñ]{2,3}){0,5}$") ] ),
        nombre_corto: new FormControl(this.asesorDetails['nombre_corto'], [ Validators.required, Validators.pattern("^[A-Z]{1}[a-z]* [A-Z]{1}[a-z]*$") ], this.userExists.bind(this) ),
        profile: new FormControl(this.asesorDetails['profile'], [ Validators.required ] ),
        tel1: new FormControl(this.asesorDetails['tel1'], [ Validators.pattern("^[1-9]{1}[0-9]{9}$") ] ),
        tel2: new FormControl(this.asesorDetails['tel2'], [ Validators.pattern("^[1-9]{1}[0-9]{9}$") ] ),
        correo: new FormControl(this.asesorDetails['correo'], [ Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$") ] ),
        pasaporte: new FormControl(this.asesorDetails['pasaporte'], [ ] ),
        visa: new FormControl(this.asesorDetails['visa'], [  ] ),
        rfc: new FormControl(this.asesorDetails['rfc'], [ Validators.pattern("^[A-Z]{4}[0-9]{2}([0]{1}[1-9]{1}|[1]{1}[0-2]{1}){1}([1-2]{1}[0-9]{1}|[0]{1}[1-9]{1}|[3]{1}[0-1]{1}){1}[A-Z0-9]{3}$")] ),
        nacimiento: new FormControl(this.asesorDetails['nacimiento'], [ Validators.pattern("^[1-2]{1}([0]{1}[1-2]{1}|[9]{1}[4-9]{1})[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] )
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

  setVal( val, control ){
    this.formDetail.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  submit(){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    let params = {
      form: this.formDetail.value,
      original: this.asesorDetails,
      queryNames: this.asesorDetailsQueryNames,
      changer: currentUser.hcInfo['id']
    }
    this.submitting = true

    this._api.postToApi( params, 'editUser' )
      .subscribe( res => {
        this.submitting = false

        if( res['status'] == 1 ){
          this.save.emit({ form: "#form_editDetails", success: true })
        }else{

          let errorMsg=""

          for (let item in res['errors']){
            errorMsg=`${errorMsg}, ${ item }`
          }

          this.toastr.error(errorMsg, 'Error!', {
            positionClass: 'toast-top-center',
            animate: 'fade'
          });
        }

      })
  }

  buildForm( array ){
    this.asesorDetails = {
      id: array.idAsesor,
      num_colaborador: array.numcol,
      nombre: array.nom,
      apellido: array.ape,
      nombre_corto: array.ncorto,
      profile: array.profileID,
      tel1: array.tel,
      tel2: array.tel1,
      correo: array.correoPersonal,
      pasaporte: array.pasaporte,
      visa: array.visa,
      rfc: array.rfc,
      nacimiento: array.fnacimiento
    }
    this.formDetail.reset(this.asesorDetails)
  }

  userExists( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this

    let promesa = new Promise(
      (resolve, reject) =>{

        let params = {
          user: control.value,
          asesor: thisData.formDetail.controls['id'].value
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

  test( something ){
    console.log( something )
  }
}

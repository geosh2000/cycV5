import { Component, Injectable, OnInit, Input, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { ApiService } from '../../services/api.service';

@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<any> {

  fromModel(date: string): NgbDateStruct {

    let tmp = new Date(parseInt(moment(date).format('YYYY')), parseInt(moment(date).format('MM')), parseInt(moment(date).format('DD')))

    return (date && tmp.getFullYear) ? {year: tmp.getFullYear(), month: tmp.getMonth(), day: tmp.getDate()} : null;
  }

  toModel(date: NgbDateStruct): string {
    // return date ? new Date(date) : null;
    return date ? moment({year: date.year, month: date.month - 1, day:date.day}).format('YYYY-MM-DD') : null;
  }
}

@Component({
  selector: 'app-add-asesor',
  templateUrl: './add-asesor.component.html',
  styleUrls: [],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class AddAsesorComponent implements OnChanges {

  @Input() modal:any
  @Input() time:any

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formAddAsesor:FormGroup;
  listProfiles
  listProfileLoaded:boolean = false

  flagLoading = {
    ciudad: false,
    oficina: false,
    departamento: false,
    puesto: false
  }

  flagExists = {
    ciudad: false,
    oficina: false,
    departamento: false,
    puesto: false
  }

  cambioPuesto = {
    fecha_solicitud: ""
  };

  asesorDetailsForm:any = [
    { name: 'nombre',           showName: 'Nombre',           tipo: 'text',     icon: 'fas fa-user fa-fw',      show: true,   readonly: false,  pattern: 'La primer letra de cada nombre debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada nombre'},
    { name: 'apellido',         showName: 'apellido',         tipo: 'text',     icon: 'far fa-user fa-fw',        show: true,   readonly: false,  pattern: 'La primer letra de cada apellido debe ser mayúscula<br>Revisa que no exista más de un espacio entre cada apellido'},
    { name: 'nombre_corto',     showName: 'nombre_corto',     tipo: 'text',     icon: 'fas fa-user-ninja fa-fw',  show: true,   readonly: false,  pattern: 'El formato debe ser con Mayúsculas y Minúsculas sin acentos<br>Sólo 1 Nombre y 1 Apellido<br>El formato debe coincidir con: "Nombre Apellido"'},
    { name: 'profile',          showName: 'profile',          tipo: 'select',   icon: 'fas fa-key fa-fw',       show: true,   readonly: false,  pattern: ''},
    { name: 'num_colaborador',  showName: 'número_colaborador',  tipo: 'text',     icon: 'far fa-address-card fa-fw',     show: true,   readonly: false,  pattern: 'El número de colaborador está compuesto por 8 dígitos'},
    { name: 'Fecha_Nacimiento', showName: 'Fecha de Nacimiento', tipo: 'date',     icon: 'fas fa-birthday-cake fa-fw',     show: true,   readonly: false,  pattern: 'Debe coincidir con el formato YYYY-MM-DD'},
    { name: 'tipo_contrato',    showName: 'tipo de contrato',    tipo: 'select2',  icon: 'fa fa-indent fa-fw',             show: true,   readonly: false,  pattern: ''},
    { name: 'fin_contrato',     showName: 'fin de contrato',     tipo: 'date',     icon: 'fa fa-calendar fa-fw',           show: false,  readonly: false,  pattern: 'Debe coincidir con el formato YYYY-MM-DD'},
  ]

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    ranges: {
               'Today': [moment(), moment()]
            }
  }

  //Populate lists
  listOptions = {
    ciudad: [],
    oficina: [],
    departamento: [],
    puesto: []
  }

  //Populate lists
  listContrato = [
    {id: 1, name: "Temporal"},
    {id: 2, name: "Indefinido"}
  ]


  parentModal:string

  defaultForm = {
    applier: null,
    factor: '1'
  }

  saveAlert:boolean = false
  retrieving:boolean = false
  errorMsg:string

  constructor(
              private _dateRangeOptions: DaterangepickerConfig,
              private route:Router,
              private _api:ApiService,
              public toastr: ToastrService
              ) {

      this.populateProfiles()

      this._dateRangeOptions.settings = {
        autoUpdateInput: false,
        locale: { format: "YYYY-MM-DD" }
      }

      this.formAddAsesor = new FormGroup({
        num_colaborador:    new FormControl('', [                       Validators.pattern("^[0-9]{8}$") ] ),
        nombre:             new FormControl('', [ Validators.required,  Validators.pattern("^[A-ZÁÉÍÓÚ]{1}[a-záéíóú]+([ ]{1}([A-ZÁÉÍÓÚ]{1}[a-záéíóú]+|[d]{1}[e]{1}[l]{0,1})){0,3}$") ] ),
        apellido:           new FormControl('', [ Validators.required,  Validators.pattern("^[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+([ ]{1}[A-ZÁÉÍÓÚÑ]{1}[a-záéíóúñ]+|[ ]{1}[a-záéíóúñ]{2,3}){0,5}$") ] ),
        nombre_corto:       new FormControl('', [ Validators.required,  Validators.pattern("^[A-Z]{1}[a-z]* [A-Z]{1}[a-z]*$") ], this.userExists.bind(this) ),
        profile:            new FormControl('', [ Validators.required ] ),
        fechaCambio:        new FormControl('', [ Validators.required,  Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        fin_contrato:       new FormControl('', [ Validators.required,  Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        Fecha_Nacimiento:   new FormControl('', [ Validators.required,  Validators.pattern("^([2]{1}[0]{1}[0-2]{1}[0-9]{1})|([1]{1}[9]{1}[0-9]{1}[0-9]{1})[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        ciudad:             new FormControl('', [ Validators.required ] ),
        oficina:            new FormControl('', [ Validators.required ] ),
        departamento:       new FormControl('', [ Validators.required ] ),
        puesto:             new FormControl('', [ Validators.required ] ),
        tipo_contrato:      new FormControl('', [ Validators.required ] ),
        factor:             new FormControl('1', [ Validators.required,  Validators.pattern("^[0-1]{1}($|[.]{1}[0-9]*$)") ] ),
        applier:            new FormControl('')
      })

      // Cambio en Fecha de Cambio -- Load Ciudad
      this.formAddAsesor.controls['fechaCambio'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['fechaCambio'].valid){
          this.puestoChange( res, 'ciudad')
        }
      });

      // Cambio en Ciudad -- Load Oficina
      this.formAddAsesor.controls['ciudad'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['ciudad'].valid){
          this.puestoChange( res, 'oficina')
        }
      });

      // Cambio en Oficina -- Load Departamento
      this.formAddAsesor.controls['oficina'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['oficina'].valid){
          this.puestoChange( res, 'departamento')
        }
      });

      // Cambio en Departamento -- Load Puesto
      this.formAddAsesor.controls['departamento'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['departamento'].valid){
          this.puestoChange( res, 'puesto')
        }
      });

      // Cambio en Puesto -- Console Log
      this.formAddAsesor.controls['puesto'].valueChanges.subscribe( res => {

      });

      // Cambio en Factor -- Console Log
      this.formAddAsesor.controls['factor'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['puesto'].valid){
          let salario = this.formAddAsesor.controls['puesto'].value['salario']
          jQuery('#salarioEstablecido').val(res * salario)
        }
      });

      this.formAddAsesor.controls['tipo_contrato'].valueChanges.subscribe( res => {
        switch(res){
          case '2':

           this.formAddAsesor.get('fin_contrato').setValidators([ Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ])
           this.formAddAsesor.get('fin_contrato').reset()
           this.asesorDetailsForm[7]['show'] = false
           break
          case '1':

            this.formAddAsesor.get('fin_contrato').setValidators([ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ])
            this.asesorDetailsForm[7]['show'] = true
            break
          default:
            break
        }

      });

  }

  ngOnChanges(){
    this.buildForm()
  }


  askCambio(){

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
              if(res['res'] == 1){
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

  buildForm( ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.defaultForm = {
      applier: currentUser.hcInfo['id'],
      factor: '1'
    }
    this.formAddAsesor.reset( this.defaultForm )
  }

  closeModal(){
    // jQuery("#form_cambioPuesto").modal('hide')
    // if(this.parentModal){
    //   jQuery(this.parentModal).modal('show')
    // }
    this.closeDialog.emit("#form_cambioPuesto")

  }

  setVal( val, control ){
    this.formAddAsesor.controls[control].setValue( val.format("YYYY-MM-DD") )
  }



  puestoChange( newVal, tipo ){


      if(newVal != ''){

        this.flagLoading[ tipo ] = true

        setTimeout( () => {

          if(true){
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));

            let params = this.formAddAsesor.value
            params.type = tipo
            // params.puestoClave = currentUser.hcInfo['hc_puesto_clave']
            params.puestoClave = "B1"
            params.areaID = currentUser.hcInfo['hc_area']
            params.udnID = currentUser.hcInfo['hc_udn']
            // params.viewAll = currentUser.credentials['view_all_agents']
            params.viewAll = currentUser.credentials[0]

            this._api.postFromApi( params, "vacantes_disponibles" )
                  .subscribe( res => {

                    console.log( res )

                    if( res ){
                      if(res['error'] == 0){
                        this.resetOptions( tipo );
                        this.listOptions[tipo] = res['vac']

                        this.flagExists[ tipo ] = true
                      }else{
                          this.toastr.error(res['msg'], 'Error!');

                          // console.log( res['msg'] )
                          this.resetOptions( tipo );

                          this.flagExists[ tipo ] = false
                        }
                      }

                      this.flagLoading[ tipo ] = false

                  })
            }
          },500)


      }else{
        this.resetOptions( tipo );
      }


  }

  resetForm(){
    this.formAddAsesor.reset()
  }

  resetOptionSingle( control ){
    this.listOptions[ control ]=[]
    this.flagLoading[ control ] = false
    this.flagExists[ control ] = false
    this.formAddAsesor.controls[ control ].setValue( '' )
  }

  resetOptions( tipo ) {
    switch(tipo){
      case "ciudad":
        this.resetOptionSingle( 'ciudad' )
        this.resetOptionSingle( 'oficina' )
        this.resetOptionSingle( 'departamento' )
        this.resetOptionSingle( 'puesto' )
        break;
      case "oficina":
        this.resetOptionSingle( 'oficina' )
        this.resetOptionSingle( 'departamento' )
        this.resetOptionSingle( 'puesto' )
        break;
      case "departamento":
        this.resetOptionSingle( 'departamento' )
        this.resetOptionSingle( 'puesto' )
        break;
      case "puesto":
        this.resetOptionSingle( 'puesto' )
        break;

    }
  }

  test( something ){

    console.log(something)
  }

  submit (  ){

    this.retrieving = true

    let restfulController:string = "SolicitudBC/addAsesor"

    // console.log(this.formAddAsesor)
    this._api.restfulPut( this.formAddAsesor.value, restfulController )
            .subscribe( res => {
              this.retrieving = false
              this.save.emit({status: true, msg: 'Asesor guardado con id ' + res['asesor_id'], title: 'Guardado!'})
              jQuery(this.modal).modal('hide')
            }, err => {
              console.log("ERROR", err)

              this.retrieving = false
              let error = err.json()
              this.save.emit({status: false, msg: error.msg, title: err.statusText})
              console.error(err.statusText, error.msg)
            })
  }


}

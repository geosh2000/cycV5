import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-cambio-puesto',
  templateUrl: './cambio-puesto.component.html',
  styles: []
})
export class CambioPuestoComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formCambioPuesto:FormGroup;

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

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  //Populate lists
  listOptions = {
    ciudad: [],
    oficina: [],
    departamento: [],
    puesto: []
  }


  parentModal:string

  defaultForm = {
    tipo: null,
    asesor: null,
    applier: null
  }

  saveAlert:boolean = false
  retrieving:boolean = false
  errorMsg:string


  constructor(
              private _dateRangeOptions: DaterangepickerConfig,
              private _api:ApiService,
              public toastr: ToastsManager, vcr: ViewContainerRef
              ) {
      this.toastr.setRootViewContainerRef(vcr);

      this._dateRangeOptions.settings = {
        autoUpdateInput: false,
        locale: { format: "YYYY-MM-DD" }
      }

      this.formCambioPuesto = new FormGroup({
        fechaCambio: new FormControl('', [ Validators.required ] ),
        ciudad: new FormControl('', [ Validators.required ] ),
        oficina: new FormControl('', [ Validators.required ] ),
        departamento: new FormControl('', [ Validators.required ] ),
        puesto: new FormControl('', [ Validators.required ] ),
        comentarios: new FormControl('', [ Validators.required ] ),
        reemplazable: new FormControl('indeterminate', [ this.checkChange ]),
        fechaLiberacion: new FormControl(''),
        asesor: new FormControl(''),
        applier: new FormControl(''),
        tipo: new FormControl('')
      })

      // Cambio en Fecha de Cambio -- Load Ciudad
      this.formCambioPuesto.controls['fechaCambio'].valueChanges.subscribe( res => {
        if( this.formCambioPuesto.controls['fechaCambio'].valid){
          this.puestoChange( res, 'ciudad')
        }

      });

      // Cambio en Ciudad -- Load Oficina
      this.formCambioPuesto.controls['ciudad'].valueChanges.subscribe( res => {
        if( this.formCambioPuesto.controls['ciudad'].valid){
          this.puestoChange( res, 'oficina')
        }

      });

      // Cambio en Oficina -- Load Departamento
      this.formCambioPuesto.controls['oficina'].valueChanges.subscribe( res => {
        if( this.formCambioPuesto.controls['oficina'].valid){
          this.puestoChange( res, 'departamento')
        }

      });

      // Cambio en Departamento -- Load Puesto
      this.formCambioPuesto.controls['departamento'].valueChanges.subscribe( res => {
        if( this.formCambioPuesto.controls['departamento'].valid){
          this.puestoChange( res, 'puesto')
        }

      });

      // Cambio en Puesto -- Console Log
      this.formCambioPuesto.controls['puesto'].valueChanges.subscribe( res => {

      });

      //reemplazable
      this.formCambioPuesto.get('reemplazable').valueChanges.subscribe( res => {

        if(res){
           this.formCambioPuesto.get('fechaLiberacion').setValidators(
             [ Validators.required, this.lessFechaLiberacion.bind( this.formCambioPuesto ) ]
          )
          this.formCambioPuesto.get('fechaLiberacion').setValue(this.formCambioPuesto.controls['fechaCambio'].value)
        }else{
          this.formCambioPuesto.get('fechaLiberacion').setValue("")
          this.formCambioPuesto.get('fechaLiberacion').setValidators(
            []
         )
        }

        this.formCambioPuesto.get('fechaLiberacion').updateValueAndValidity();
      })
  }

  ngOnChanges(){

  }

  ngOnInit() {



  }

  askCambio(){

  }

  buildForm( array, tipo ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.defaultForm = {
      tipo: tipo,
      asesor: array.idAsesor,
      applier: currentUser.hcInfo['id']
    }
    // this.formCambioPuesto.reset()
  }

  closeModal(){
    // jQuery("#form_cambioPuesto").modal('hide')
    // if(this.parentModal){
    //   jQuery(this.parentModal).modal('show')
    // }
    this.closeDialog.emit("#form_cambioPuesto")

  }

  setVal( val, control ){
    this.formCambioPuesto.controls[control].setValue( val.format("YYYY-MM-DD") )
  }


  puestoChange( newVal, tipo ){


      if(newVal != ''){

        this.flagLoading[ tipo ] = true

        setTimeout( () => {

          if(true){
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));

            let params = this.formCambioPuesto.value
            params.type = tipo
            // params.puestoClave = currentUser.hcInfo['hc_puesto_clave']
            params.puestoClave = "B1"
            params.areaID = currentUser.hcInfo['hc_area']
            params.udnID = currentUser.hcInfo['hc_udn']
            // params.viewAll = currentUser.credentials['view_all_agents']
            params.viewAll = currentUser.credentials[0]

            this._api.postFromApi( params, "vacantes_disponibles" )
                  .subscribe( res => {
                    if( res ){
                      if(res.error == 0){
                        this.resetOptions( tipo );
                        this.listOptions[tipo] = res.vac

                        this.flagExists[ tipo ] = true
                      }else{
                          this.toastr.error(res.msg, 'Error!', {
                            positionClass: 'toast-top-center',
                            animate: 'fade'
                          });

                          // console.log( res.msg )
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
    this.formCambioPuesto.reset()
  }

  resetOptionSingle( control ){
    this.listOptions[ control ]=[]
    this.flagLoading[ control ] = false
    this.flagExists[ control ] = false
    this.formCambioPuesto.controls[ control ].setValue( '' )
    this.formCambioPuesto.controls[ 'reemplazable' ].setValue( false )
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
    this.formCambioPuesto.controls['asesor'].setValue(this.defaultForm['asesor'])
    this.formCambioPuesto.controls['applier'].setValue(this.defaultForm['applier'])
    this.formCambioPuesto.controls['tipo'].setValue(this.defaultForm['tipo'])

    let restfulController:string
    if( this.defaultForm['tipo'] == 'ask' ){
      restfulController = "SolicitudBC/cambio_solicitud"
    }else{
      restfulController = "SolicitudBC/set_cambio_solicitud"
    }

    // console.log(this.formCambioPuesto)
    this._api.restfulPut( this.formCambioPuesto.value, restfulController )
            .subscribe( res => {
              this.retrieving = false
              if(res['status']){
                this.save.emit({form: "#form_cambioPuesto", status: true})
              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }

            })
  }

  //Validación Fecha Liberación
  lessFechaLiberacion( control: FormControl ): { [s:string]:boolean }{

    let formCambioPuesto:any = this

    if( moment(`${control.value}`) > moment(`${formCambioPuesto.controls['fechaCambio'].value}`) ){
      return {
        lessFechaLiberacion: true
      }
    }else{
      return null
    }

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


}

import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-set-baja',
  templateUrl: './set-baja.component.html',
  styles: []
})
export class SetBajaComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formSetBaja:FormGroup;

  bajaData

  tipo:string
  titleSubmit:string

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  parentModal:string
  retrieving:boolean = false
  saveAlert:boolean = false
  errorMsg:string = ""


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

      this.formSetBaja = new FormGroup({
        tipo: new FormControl(this.tipo, [ Validators.required ]),
        id: new FormControl('', [ Validators.required ]),
        fechaBaja: new FormControl('', [ Validators.required ] ),
        comentarios: new FormControl('', [ Validators.required ] ),
        recontratable: new FormControl('indeterminate', [ this.checkChange ]),
        reemplazable: new FormControl('indeterminate', [ this.checkChange ]),
        fechaLiberacion: new FormControl(''),
        applier: new FormControl('')
      })

      //reemplazable
      this.formSetBaja.get('reemplazable').valueChanges.subscribe( res => {

        if(res){
           this.formSetBaja.get('fechaLiberacion').setValidators(
             [ Validators.required, this.lessFechaLiberacion.bind( this.formSetBaja ) ]
          )
          this.formSetBaja.get('fechaLiberacion').setValue(this.formSetBaja.controls['fechaBaja'].value)
        }else{
          this.formSetBaja.get('fechaLiberacion').setValue("")
          this.formSetBaja.get('fechaLiberacion').setValidators(
            []
         )
        }

        this.formSetBaja.get('fechaLiberacion').updateValueAndValidity();
      })
  }

  ngOnInit() {
  }

  closeModal(){

    // console.log(this.parentModal)

    if(this.parentModal == null || this.parentModal == ''){
      jQuery("#form_setBaja").modal('hide')
    }else{
      this.closeDialog.emit("#form_setBaja")
    }


  }

  setVal( val, control ){
    this.formSetBaja.controls[control].setValue( val.format("YYYY-MM-DD") )
  }


  resetForm(){
    this.formSetBaja.reset()
  }

  test( something ){

    console.log(something)
  }

  submit (  ){
    // console.log( this.formSetBaja )
  }

  //Validación Fecha Liberación
  lessFechaLiberacion( control: FormControl ): { [s:string]:boolean }{

    let formSetBaja:any = this

    if( moment(`${control.value}`) > moment(`${formSetBaja.controls['fechaBaja'].value}`) ){
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

  buildForm( array ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.bajaData = {
      tipo: this.tipo,
      id: array.idAsesor,
      fechaBaja: '',
      comentarios: '',
      reemplazable: 'indeterminate',
      fechaLiberacion: '',
      applier: currentUser.hcInfo['id'],
    }
    this.formSetBaja.reset(this.bajaData)
  }

  // submitBaja(){
  //   console.log(this.formSetBaja.value)
  //
  //
  // }
  submitBaja(){
    // console.log("sending")
    this.retrieving = true
    let api:string

    if(this.formSetBaja.controls['tipo'].value == 'ask' ){
      api = "SolicitudBC/baja_solicitud"
    }else{
      api = "SolicitudBC/baja_set"
    }

    this._api.restfulPut( this.formSetBaja.value, api)
      .subscribe( res => {

        this.retrieving = false

        if( res['status'] ){

          this.save.emit({form: "#form_setBaja", status: true})
          // console.log( res )
        }else{
          this.saveAlert = true
          this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
        }

      })

  }


}

import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-vacante',
  templateUrl: './add-vacante.component.html',
  styles: []
})
export class AddVacanteComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formAddVacante:FormGroup

  formAddVacanteDetails:Object = {
    udn:            { tipo: 'select', set: false, value: '', list: [1], title: "UDN",          required: true, readonly: false, pattern: ''},
    area:           { tipo: 'select', set: false, value: '', list: [1], title: "Area",         required: true, readonly: false, pattern: ''},
    departamento:   { tipo: 'select', set: false, value: '', list: [1], title: "Departamento", required: true, readonly: false, pattern: ''},
    puesto:         { tipo: 'select', set: false, value: '', list: [1], title: "Puesto",       required: true, readonly: false, pattern: ''},
    alias:          { tipo: 'select', set: false, value: '', list: [1], title: "Alias",        required: true, readonly: false, pattern: ''},
    oficina:        { tipo: 'select', set: false, value: '', list: [1], title: "PDV/Oficina",  required: true, readonly: false, pattern: ''},
    esquema:        { tipo: 'text',   set: true,  value: '', list: [1], title: "Esquema",      required: true, readonly: false, pattern: '4, 6, 8 o 10'},
    inicio:         { tipo: 'date',   set: true,  value: '', list: [1], title: "Inicio",       required: true, readonly: false, pattern: ''},
    fin:            { tipo: 'date',   set: true,  value: '', list: [1], title: "Fin",          required: false,readonly: false, pattern: ''},
    comentarios:    { tipo: 'text',   set: true,  value: '', list: [1], title: "Comentarios",  required: false,readonly: false, pattern: ''},
    cantidad:       { tipo: 'text',   set: true,  value: '', list: [1], title: "Cantidad",     required: true, readonly: false, pattern: 'Número del 1 al 10'}
  }

  defaults:Object = {
    udn:            { id: '' },
    area:           { id: '' },
    departamento:   { id: '' },
    puesto:         { id: '' },
    alias:          { id: '', codigo: '' },
    oficina:        { id: '' },
    esquema:        '8',
    inicio:         '',
    fin:            '',
    comentarios:    '',
    cantidad:       1
  }

  submitting:boolean = false
  loading:boolean = false

  currentUser:any

  saveAlert:boolean = false
  errorMsg:string = ""
  codigoSeleccionado:string = ""

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  }

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                public toastr: ToastsManager, vcr: ViewContainerRef
                ){

      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.defaults['creador']=currentUser.hcInfo.id

      this.formAddVacante = new FormGroup({
        creador:      new FormControl(currentUser.hcInfo.id, [ Validators.required ]),
        udn:          new FormControl({ id: '' }, [ this.customRequired ]),
        area:         new FormControl({ id: '' }, [ this.customRequired ]),
        departamento: new FormControl({ id: '' }, [ this.customRequired ]),
        puesto:       new FormControl({ id: '' }, [ this.customRequired ]),
        alias:        new FormControl({ id: '', codigo: '' }, [ this.customRequired ]),
        oficina:      new FormControl({ id: '' }, [ this.customRequired ]),
        esquema:      new FormControl( 8,         [ Validators.required, Validators.pattern("^([4]{1}$|[6]{1}$|[8]{1}$|[1]{1}[0]{1}$)") ]),
        inicio:       new FormControl( '',        [ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        fin:          new FormControl( '',        [ Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        comentarios:  new FormControl( '' ),
        cantidad:     new FormControl( 1,         [ Validators.required , Validators.pattern("^([1-9]{1}$|[1]{1}[0]{1}$)") ]),
      })

      //UDN Change
      this.formAddVacante.controls['udn'].valueChanges.subscribe( res => {
        if(res.id == '' || res == ''){
          this.deactivate(['area','departamento', 'puesto', 'alias'])
        }else{
          this.getCodigos( 'Area' )
        }
      })

      //area Change
      this.formAddVacante.controls['area'].valueChanges.subscribe( res => {
        if(res.id == '' || res == ''){
          this.deactivate(['departamento', 'puesto', 'alias'])
        }else{
          this.getCodigos( 'Departamento' )
        }
      })

      //departamento Change
      this.formAddVacante.controls['departamento'].valueChanges.subscribe( res => {
        if(res.id == '' || res == ''){
          this.deactivate(['puesto', 'alias'])
        }else{
          this.getCodigos( 'Puesto' )
        }
      })

      //puesto Change
      this.formAddVacante.controls['puesto'].valueChanges.subscribe( res => {
        if(res.id == '' || res == ''){
          this.deactivate(['alias'])
        }else{
          this.getCodigos( 'Alias' )
        }
      })

      //alias Change
      this.formAddVacante.controls['alias'].valueChanges.subscribe( res => {
        this.codigoSeleccionado = res.codigo
      })
  }

  buildForm(){
    this.formAddVacante.reset( this.defaults )
    this.getCodigos( 'UDN' )
    this.getPdvs()
  }

  getPdvs(){
    this._api.restfulGet( '', `Headcount/listPdvs` )
            .subscribe( res=> {

              this.formAddVacanteDetails['oficina'].set = true

              if(res['status']){

                this.formAddVacanteDetails['oficina'].list = res['data']

              }else{
                console.error( res )
              }
            })
  }

  getCodigos( level ){

    this.loading = true
    let params:string
    let index:string

    switch(level){
      case 'UDN':
        index = "udn"
        params = ""
        this.activate('udn')
        this.deactivate(['area','departamento', 'puesto', 'alias'])
        break
      case 'Area':
        index = "area"
        params = `${this.formAddVacante.controls['udn'].value.id}`
        this.activate('area')
        this.deactivate(['departamento', 'puesto', 'alias'])
        break
      case 'Departamento':
        index = "departamento"
        this.activate('departamento')
        this.deactivate(['puesto', 'alias'])
        params = `${this.formAddVacante.controls['udn'].value.id}/${this.formAddVacante.controls['area'].value.id}`
        break
      case 'Puesto':
        index = "puesto"
        this.activate('puesto')
        this.deactivate(['alias'])
        params = `${this.formAddVacante.controls['udn'].value.id}/${this.formAddVacante.controls['area'].value.id}/${this.formAddVacante.controls['departamento'].value.id}`
        break
      case 'Alias':
        index = "alias"
        this.activate('alias')
        params = `${this.formAddVacante.controls['udn'].value.id}/${this.formAddVacante.controls['area'].value.id}/${this.formAddVacante.controls['departamento'].value.id}/${this.formAddVacante.controls['puesto'].value.id}`
        break
    }

    this._api.restfulGet( '', `Headcount/listPuestos/${ index }/${ params }` )
            .subscribe( res=> {

              this.loading = false
              this.formAddVacanteDetails[index].set = true

              if(res['status']){

                this.formAddVacanteDetails[index].list = res['data']

              }else{
                console.error( res )
              }
            })
  }

  deactivate( array ){
    for(let item of array){
      this.formAddVacanteDetails[item].set = false
      this.formAddVacante.controls[item].setValue({id: ''})
    }
  }

  activate( item ){
    if(this.formAddVacante.controls[item].value.id != {id: ''}){
      this.formAddVacante.controls[item].setValue({id: ''})
    }
  }

  ngOnInit() {
  }

  submit(){
    this.submitting = true

    this._api.restfulPut(this.formAddVacante.value, 'Headcount/addVacante')
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.save.emit({form: "#form_addVacante", status: true, mopers: res['ids_vacantes']})
                this.formAddVacante.reset( this.defaults )

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })
  }

  setVal( val, control ){
    this.formAddVacante.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  //Validación Check
  customRequired( control: FormControl ): { [s:string]:boolean }{

    if( control.value == '' || control.value.id == '' ){
      return {
        required: true
      }
    }else{
      return null
    }

  }

}

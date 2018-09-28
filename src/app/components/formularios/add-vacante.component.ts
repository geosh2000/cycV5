import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/service.index';

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
  dataCodes:Object = {}
  dataPdvs:any = []

  selectedCountry:any = ''
  validateFlag:boolean = false

  formAddVacanteDetails:Object = {}
  formAddVacanteDetailsDefault:Object = {
    main:           { tipo: 'select', set: true, value: '', list: [1], title: 'mainDep',      required: true, readonly: false, pattern: ''},
    udn:            { tipo: 'select', set: false, value: '', list: [1], title: 'UDN',          required: true, readonly: false, pattern: ''},
    area:           { tipo: 'select', set: false, value: '', list: [1], title: 'Area',         required: true, readonly: false, pattern: ''},
    departamento:   { tipo: 'select', set: false, value: '', list: [1], title: 'Departamento', required: true, readonly: false, pattern: ''},
    dep:            { tipo: 'text',   set: false, value: '', list: [1], title: 'dep',           required: true, readonly: false, pattern: ''},
    puesto:         { tipo: 'select', set: false, value: '', list: [1], title: 'Puesto',       required: true, readonly: false, pattern: ''},
    alias:          { tipo: 'select', set: false, value: '', list: [1], title: 'Alias',        required: true, readonly: false, pattern: ''},
    oficina:        { tipo: 'select', set: false, value: '', list: [1], title: 'PDV/Oficina',  required: true, readonly: false, pattern: ''},
    esquema:        { tipo: 'text',   set: true,  value: '', list: [1], title: 'Esquema',      required: true, readonly: false, pattern: '4, 6, 8 o 10'},
    inicio:         { tipo: 'date',   set: true,  value: '', list: [1], title: 'Inicio',       required: true, readonly: false, pattern: ''},
    fin:            { tipo: 'date',   set: true,  value: '', list: [1], title: 'Fin',          required: false,readonly: false, pattern: ''},
    comentarios:    { tipo: 'text',   set: true,  value: '', list: [1], title: 'Comentarios',  required: true, readonly: false, pattern: ''},
    ciudad:         { tipo: 'text',   set: false, value: '', list: [1], title: 'Ciudad',       required: true, readonly: false, pattern: ''},
    cantidad:       { tipo: 'text',   set: true,  value: '', list: [1], title: 'Cantidad',     required: true, readonly: false, pattern: 'Ingresa sólo números enteros'}
  }

  defaults:Object = {
    main:           '',
    udn:            '',
    area:           '',
    departamento:   '',
    puesto:         '',
    alias:          '',
    oficina:        '',
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
  errorMsg:string = ''
  codigoSeleccionado:string = ''

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: 'left'
  }

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                public toastr: ToastrService
                ){

      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.defaults['creador']=currentUser.hcInfo.id

      this.formAddVacante = new FormGroup({
        creador:      new FormControl(currentUser.hcInfo.id, [ Validators.required ]),
        main:         new FormControl( '', [ Validators.required ]),
        udn:          new FormControl( '', [ Validators.required ]),
        area:         new FormControl( '', [ Validators.required ]),
        departamento: new FormControl( '', [ Validators.required ]),
        dep:          new FormControl( '', [ Validators.required ]),
        puesto:       new FormControl( '', [ Validators.required ]),
        alias:        new FormControl( '', [ Validators.required ]),
        oficina:      new FormControl( '', [ Validators.required ]),
        ciudad:       new FormControl( '', [ Validators.required ]),
        esquema:      new FormControl( 8,         [ Validators.required, Validators.pattern('^([4]{1}$|[6]{1}$|[8]{1}$|[1]{1}[0]{1}$)') ]),
        inicio:       new FormControl( '',        [ Validators.required, Validators.pattern('^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$') ] ),
        fin:          new FormControl( '',        [ Validators.pattern('^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$') ] ),
        comentarios:  new FormControl( '' ),
        cantidad:     new FormControl( 1,         [ Validators.required , Validators.pattern('^[1-9]{1}[0-9]*$') ]),
      })

      this.formAddVacanteDetails = JSON.parse(JSON.stringify(this.formAddVacanteDetailsDefault))
      this.getCodigos()
      this.getPdvs()
  }

  buildForm(){
    this.formAddVacanteDetails = JSON.parse(JSON.stringify(this.formAddVacanteDetailsDefault))
    this.formAddVacante.reset( this.defaults )
    this.selectedCountry = ''
    this.validateFlag = false
    jQuery('#form_addVacante').modal('show');
  }

  getPdvs(){
    this._api.restfulGet( '', `Headcount/hcListPdvs` )
              .subscribe( res => {

                this.loading = false
                this.dataPdvs =  res['data']

              }, err => {

                console.log('ERROR', err)

                this.loading = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getCodigos(){
    this.loading = true

    this._api.restfulGet( '', `Headcount/hcListCodes` )
              .subscribe( res => {

                this.loading = false
                this.dataCodes =  res['data']

              }, err => {

                console.log('ERROR', err)

                this.loading = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

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

  selectChange( target, val, pais? ){
    let fields = {
      'main'         : ['udn','area','departamento','puesto','alias','oficina'],
      'udn'          : ['area','departamento','puesto','alias'],
      'area'         : ['departamento','puesto','alias'],
      'departamento' : ['puesto','alias'],
      'puesto'       : ['alias'],
      'alias'        : []
    }

    if( fields[target] ){
      let i = 0
      for( let item of fields[target] ){
        this.formAddVacante.controls[item].reset('')
        if( val != '' && i == 0 ){
          this.formAddVacanteDetails[item]['set'] = true
        }else{
          this.formAddVacanteDetails[item]['set'] = false
        }
        i++
      }
    }

    if( pais ){
      for( let main of this.dataCodes['main'] ){
        if( main['id'] == val ){
          this.selectedCountry = main['pais']
          return true
        }
      }
    }

    if( target == 'oficina' ){
      for( let ofs of this.dataPdvs ){
        if( ofs['id'] == val ){
          this.formAddVacante.controls['ciudad'].setValue(ofs['branchZoneId'])
          return true
        }
      }
    }

    if( target == 'departamento' ){
      for( let dp of this.dataCodes['departamento'] ){
        if( dp['id'] == val ){
          this.formAddVacante.controls['dep'].setValue(dp['pcrc'])
          return true
        }
      }
    }
  }

  saveForm(){
    this.submitting = true

    this._api.restfulPut(this.formAddVacante.value, 'Headcount/hcAddVacante')
            .subscribe( res => {
              this.submitting = false

                this.formAddVacante.reset( this.defaults )
                this.save.emit({mopers: res['data']})
                jQuery('#form_addVacante').modal('hide');

            }, err => {

              console.log('ERROR', err)

              this.loading = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  submit(){
    this.validateFlag = true

    if( this.formAddVacante.valid ){
      this.saveForm()
    }
  }

  setVal( val, control ){
    this.formAddVacante.controls[control].setValue( val.format('YYYY-MM-DD') )
  }

  // Validación Check
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

import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-ajuste-salarial',
  templateUrl: './ajuste-salarial.component.html',
  styles: []
})
export class AjusteSalarialComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formSolicitarAjuste:FormGroup

  submitting:boolean = false

  currentUser:any

  oldSalary:number

  saveAlert:boolean = false
  errorMsg:string = ""

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

    this.toastr.setRootViewContainerRef(vcr);

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

    this.formSolicitarAjuste = new FormGroup({
      asesor: new FormControl('', [ Validators.required ] ),
      ajuste: new FormControl('', [ Validators.required, Validators.pattern("^([0-5]{1}[0-9]{1}|[1-9]{1})($|[.]{1}[0-9]{1,2}$)") ] ),
      antiguo_salario: new FormControl('', [ Validators.required ] ),
      nuevo_salario: new FormControl('', [ Validators.required ] ),
      comentarios_solicitante: new FormControl('', [ Validators.required ] ),
      fecha_cambio: new FormControl('', [ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
      solicitante: new FormControl('', [ Validators.required ] )
    })

    // Cambio en Factor -- Console Log
    this.formSolicitarAjuste.controls['ajuste'].valueChanges.subscribe( res => {
      if( this.formSolicitarAjuste.controls['ajuste'].valid){
        this.formSolicitarAjuste.controls['nuevo_salario'].setValue(((1+res/100) * this.oldSalary).toFixed(2))
        // jQuery('#nuevo_salario').val(((1+res/100) * this.oldSalary).toFixed(2))
      }
    });

  }

  ngOnInit() {
  }

  setVal( val, control ){
    this.formSolicitarAjuste.controls[control].setValue( val.format("YYYY-MM-DD") )
  }

  buildForm( array ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.formSolicitarAjuste.controls['solicitante'].setValue( currentUser.hcInfo['id'] )
    this.formSolicitarAjuste.controls['asesor'].setValue( array.idAsesor )
    this.formSolicitarAjuste.controls['antiguo_salario'].setValue( (+array.salario['mensual']).toFixed(2) )
    this.formSolicitarAjuste.controls['nuevo_salario'].setValue( (+array.salario['mensual']).toFixed(2) )
    this.oldSalary = array.salario['mensual']

  }

  submit(){
    this.submitting = true
    this._api.restfulPut( this.formSolicitarAjuste.value, "SolicitudBC/solicitudAjuste" )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.formSolicitarAjuste.reset()
                this.save.emit({form: "#form_ajusteSalarial", status: true})
                // console.log( res )


              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })
  }

}

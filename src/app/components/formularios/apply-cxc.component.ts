import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-apply-cxc',
  templateUrl: './apply-cxc.component.html',
  styles: []
})
export class ApplyCxcComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formApplyCxc:FormGroup
  formApplyCxcDetail:Object

  submitting:boolean = false
  applying:boolean = false

  currentUser:any

  saveAlert:boolean = false
  errorMsg:string = ""

  asesor:number

  ready:boolean = false
  noRows:boolean = false

  montoaPagar:number

  listFechas = []

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

    this.formApplyCxc = new FormGroup({
      id:         new FormControl( '',  [ Validators.required ] ),
      created_by: new FormControl( '',  [ Validators.required ] ),
      quincenas:  new FormControl( "1",   [ Validators.min(1), Validators.max(15), Validators.required ]),
      inicio:     new FormControl( '',  [ Validators.required ] ),
      monto:      new FormControl( '',  [ Validators.required ] )
    })

    // Cambio en Puesto -- Console Log
    this.formApplyCxc.valueChanges.subscribe( res => {
      this.montoaPagar = this.formApplyCxc.controls['monto'].value / this.formApplyCxc.controls['quincenas'].value
    });

  }

  ngOnInit() {
  }

  getFechasNomina(){
    this._api.restfulGet('15','Cxc/getCalendario')
              .subscribe( res => {
                if(res['status']){
                  this.listFechas = res['data']
                }else{
                  console.error( res['msg'] )
                }
              })
  }

  buildForm( array ){

    // Init Flags
    this.ready = false
    this.noRows = false
    this.applying = false
    this.asesor = array.idAsesor

    // Init Forms
    this.formApplyCxcDetail = {}

    this.getFechasNomina()

    this.getCxCs( this.asesor )
  }

  showApplyForm( id ){

    this.applying = true
    this.formApplyCxc.controls['id'].setValue(id)
    this.formApplyCxc.controls['created_by'].setValue(this.currentUser.hcInfo['id'])
    this.formApplyCxc.controls['quincenas'].setValue(1)
    this.formApplyCxc.controls['inicio'].setValue('')
    this.formApplyCxc.controls['monto'].setValue(this.formApplyCxcDetail[id].monto)

    this.montoaPagar = this.formApplyCxc.controls['monto'].value / this.formApplyCxc.controls['quincenas'].value

    this.formApplyCxcDetail[id].flagApply = true

    // console.log(this.formApplyCxc)
  }

  closeApplyForm( id ){

    this.applying = false
    this.formApplyCxc.reset()

    this.formApplyCxcDetail[id].flagApply = false
  }

  getCxCs( asesor ){
    let saldos:any;

    this._api.restfulGet( asesor, 'Cxc/getToApply' )
            .subscribe( res => {
              this.ready = true

              if(res['status']){

                if(res['rows'] != 0){

                  for(let cxc of res['data']){

                    this.formApplyCxcDetail[cxc.id] = cxc
                    this.formApplyCxcDetail[cxc.id]['flagApply'] = false


                  }

                }else{
                  this.noRows = true
                }

              }else{
                console.error( res )
              }

            })
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

  submit(){

    this.submitting = true

    this._api.restfulPut( this.formApplyCxc.value, 'Cxc/applyCxc' )
            .subscribe( res => {
              this.submitting = false
              if( res['status'] ){

                this.save.emit({form: "#form_applyCxc", status: true})
                this.formApplyCxc.reset()

                // console.log( res['msg'] )

              }else{
                this.saveAlert = true
                this.errorMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                console.error( res )
              }
            })

  }

}

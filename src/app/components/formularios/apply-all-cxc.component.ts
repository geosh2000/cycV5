import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-apply-all-cxc',
  templateUrl: './apply-all-cxc.component.html',
  styles: []
})
export class ApplyAllCxcComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formApplyCxc:FormGroup
  formApplyCxcDetail:Object

  showContents:boolean = false
  mainCredential:string = 'cxc_apply'

  filter:any

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
                public _dateRangeOptions: DaterangepickerConfig,
                public _api:ApiService,
                private _init:InitService,
                public toastr: ToastrService,
                public route:Router,
                public activatedRoute:ActivatedRoute
                ){

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

    this.activatedRoute.params.subscribe( params => {
      if( params.filter ){
        // console.log(this.getAsesorDetail)
        this.filter = params.filter
      }

      this.buildForm()

    });

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
    this._api.restfulGet('12','Cxc/getCalendario')
              .subscribe( res => {
                if(res['status']){
                  this.listFechas = res['data']
                }else{
                  console.error( res['msg'] )
                }
              })
  }

  buildForm(  ){

    // Init Flags
    this.ready = false
    this.noRows = false
    this.applying = false
    this.asesor = 0

    // Init Forms
    this.formApplyCxcDetail = {}

    this.getFechasNomina()

    this.getCxCs( 0 )
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

    this._api.restfulGet( '', `Cxc/getToApply/${asesor}/${this.filter}` )
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

                this.buildForm()
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

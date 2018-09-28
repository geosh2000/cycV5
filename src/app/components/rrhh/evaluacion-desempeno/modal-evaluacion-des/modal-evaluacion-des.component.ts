import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, ZonaHorariaService } from '../../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-modal-evaluacion-des',
  templateUrl: './modal-evaluacion-des.component.html',
  styles: []
})
export class ModalEvaluacionDesComponent implements OnInit, OnChanges {

  @Input() nombre: ''
  @Input() contrato: ''
  @Input() manager:boolean = false
  @Input() agent:boolean = true
  @Input() superReview:boolean = false
  @Input() new:boolean = false
  @Input() asesor:any = ''
  @Input() status:any = ''
  @Input() timeLeft:any = 0
  @Input() openTime:any = ''

  @Output() reload = new EventEmitter<any>()

  rate:number = 1
  hover:number = 1

  loading:Object = {}
  form:FormGroup
  formRaw:any
  formData:any
  formReady:boolean = false
  formSubmit:boolean = false
  metaData:Object = {}

  oldId:any
  usp:any = ''
  usn:any = ''

  constructor( private rateConf: NgbRatingConfig, private _api:ApiService, private toastr:ToastrService, private _zh: ZonaHorariaService ) {

    // customize default values of ratings used by this component tree
    rateConf.max = 5;

    this.oldId = this.asesor

    this.getForm()
  }

  ngOnInit() {
  }

  ngOnChanges( changes: SimpleChanges ) {
    this.usp = ''
    this.usn = ''

    if( this.form ){
      this.form.reset()
      this.formSubmit = false
      this.buildForm()
    }

    if( !this.new && this.asesor != '' && this.contrato != '' ){
      this.getEval()
    }
  }


  getForm(){
    this.loading['form'] = true

    this._api.restfulGet( '','Rrhh/form' )
              .subscribe( res => {

                this.loading['form'] = false
                this.formRaw = res['data']
                this.buildForm()

              }, err => {
                console.log('ERROR', err)

                this.loading['form'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  buildForm(){

    let data = this.formRaw

    let groups = []
    let form = {}, i = 0
    this.form = new FormGroup({})

    for( let group of data ){

      let validators = []

      if( groups.indexOf(group['grupo']) == -1 ){
        groups.push(group['grupo'])
      }

      i = groups.indexOf(group['grupo'])

      group['hover'] = ''
      group['rate'] = ''

      if( form[i] ){
        form[i].push(group)
      }else{
        form[i] = [group]
      }

      if( group['showStart'] == 1 ){
        validators.push(Validators.required)
      }

      if( group['field'] == 'observ_gerencia' ){
        // console.log( 'manager', this.manager )
        // console.log( 'status', parseInt(this.status) )
        // console.log( 'sm', parseInt(group['showManager']) )
      }

      if( ( this.agent && group['showAgent'] == 1 ) || ( this.manager && parseInt(this.status) == 2 && parseInt(group['showManager']) == 1 ) || ( this.superReview && parseInt(this.status) == 3 && parseInt(group['showSup']) == 1 ) ){
        if( group['field'] == 'observ_gerencia' ){
        }
        validators.push(Validators.required)
        // console.log( validators )
      }

      this.form.addControl( 'com_'+group['field'], new FormControl('', validators) )
      if( group['tipo'] == 'select' ){
        validators.push( Validators.pattern('^[1-5]{1}$') )
        this.form.addControl( 'rate_'+group['field'], new FormControl('', validators) )
      }
    }

    this.formData = form
    this.formReady = true

    // console.log(this.form.controls)
    // console.log(this)
  }

  rateText(rate){
    switch( rate ){
      case 1:
        return 'N - No Cumple'
      case 2:
        return 'M - Mejorable'
      case 3:
        return 'C - Cumple'
      case 4:
        return 'S - Supera'
      case 5:
        return 'E - Excede'
    }
  }

  submit( renew, manager, superReview, agent=false ){
    this.formSubmit = true

    if( this.form.controls['status'] ){
      this.form.removeControl('status')
    }

    if( this.new || manager || superReview ){
      this.form.addControl('status', new FormControl(  '', []))

      let st = agent ? 6 : (superReview ? 5 : (manager ? (renew ? 3 : 4) : (renew ? 1 : 2)))
      this.form.controls['status'].setValue( st )
    }

    let params = {
      'form': this.form.value,
      'keys': { asesor: this.asesor, contrato: this.contrato }
    }

    if( this.form.valid ){

      if( agent ){
        params['form']['status'] = 6
        this.validateAsesor( params )
      }else{
        this.submitData(params)
      }

    }


  }

  submitData( params ){
    this.loading['save'] = true

      this._api.restfulPut( params,'Rrhh/saveEval' )
                .subscribe( res => {

                  this.loading['save'] = false
                  this.toastr.success('Registro Guardado', 'Guardado')
                  jQuery('#desempeno').modal('hide')
                  this.reload.emit( true )

                }, err => {
                  console.log('ERROR', err)

                  this.loading['save'] = false

                  let error = err.error
                  this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                  console.error(err.statusText, error.msg)

                })
  }

  getEval(){

    let params = {
      asesor: this.asesor,
      contrato: this.contrato
    }


    this.loading['getEval'] = true

    this._api.restfulPut( params,'Rrhh/getEval' )
              .subscribe( res => {

                this.loading['getEval'] = false
                this.metaData = {}

                // console.log(this.form.controls)

                for( let field in res['data'] ){
                  if( field.match(/^(rate_|com_)/g) ){
                    if( field.match(/^(rate_)/g) ){
                      this.form.controls[field].setValue( parseInt(res['data'][field]) )
                    }else{
                      this.form.controls[field].setValue( res['data'][field] )
                    }
                  }
                }

                this.usn = res['data']['usuario']
                this.metaData['sup'] = res['data']['sup']
                this.metaData['sup_date'] = res['data']['date_created']
                this.metaData['manager'] = res['data']['manager']
                this.metaData['manager_date'] = res['data']['manager_date']
                this.metaData['review'] = res['data']['review']
                this.metaData['review_date'] = res['data']['review_date']
                this.metaData['agent'] = res['data']['agent']
                this.metaData['agent_date'] = res['data']['accepted_date']

              }, err => {
                console.log('ERROR', err)

                this.loading['getEval'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })



  }

  resultRate( group ){
    let sum = 0
    let regs = 0

    if( group == 'all' ){
      // tslint:disable-next-line:forin
      for( let control in this.form.controls ){
        if( control.match(/^rate_/g) ) {
          sum += this.form.controls[control].value
          regs++
        }
      }

      return Math.round(sum/regs)
    }

    for( let item of this.formData[group] ){
      if( this.form.controls['rate_'+item['field']] ){
        sum += this.form.controls['rate_'+item['field']].value
        regs++
      }
    }

    return Math.round(sum/regs)

  }

  badgeColor( hover, field ){

    let colors = {
      1: 'bg-danger',
      2: 'bg-danger',
      3: 'bg-warning',
      4: 'bg-success',
      5: 'bg-success',
    }


    if( hover == 0 || hover == '' ){
      if( this.form.controls['rate_'+field].value  ){
        return colors[this.form.controls['rate_'+field].value]
      }else{
        return 'bg-secondary'
      }
    }

    return colors[hover]
  }

  showCom( item ){

    let field  = item['field']

    switch( field ){
      case 'observ_super':
        if( this.agent && this.form.controls['com_observ_review'].value ){
          return false
        }

        return true
      case 'observ_review':
        if( parseInt(this.status) == 3 || parseInt(this.status) == 5 ){
          return true
        }

        if( parseInt(this.status) == 6 && this.form.controls['com_observ_review'].value ){
          return true
        }

        if( !this.new && this.form.controls['com_observ_review'].value ){
          return true
        }

        return false
      case 'observ_gerencia':
        if( parseInt(this.status) == 1 ||  parseInt(this.status) == 2 || parseInt(this.status) == 3 || parseInt(this.status) == 4 || parseInt(this.status) == 5 || parseInt(this.status) == 6 ){
          return this.agent ? false : true
        }

        return false
      case 'observ_colab':
        if( parseInt(this.status) == 1 || parseInt(this.status) == 5 || parseInt(this.status) == 6 ){
          return true
        }

        return false
      default:
        return true
    }
  }

  validateAsesor( params ){
    this.loading['save'] = true

    this._api.restfulPut( { usp: this.usp, usn: this.usn, remember: false }, 'Login/login/1')
              .subscribe( res => {

                this.loading['save'] = false

                if( res['data']['username'] == this.usn ){
                  this.submitData(params)
                }

                console.error('El usuario y contraseña ingresados no corresponden al asesor en revisión', 'Error')

              }, err => {
                console.log('ERROR', err)

                this.loading['save'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)
                return false
              })
  }

  printDate( date, format ){
    return moment.tz(date, 'America/Mexico_city').tz( this._zh.zone ).format(format)
  }

}

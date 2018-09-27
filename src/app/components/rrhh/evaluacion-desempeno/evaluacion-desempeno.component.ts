import { Component, OnInit, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { Title } from '@angular/platform-browser';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { ActivatedRoute } from '@angular/router';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

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
  selector: 'app-evaluacion-desempeno',
  templateUrl: './evaluacion-desempeno.component.html',
  styles: [`
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  }
`],
})
export class EvaluacionDesempenoComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  processLoading:boolean = false
  mainCredential:string = 'eval_desemp_consulta'

  loading:Object = {}
  operaciones:any = []
  opSelected:any = ''
  asesorSelected:any = ''
  searchBy:any = ''

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct
  dateSelected:Object = {}

  evalsData:any = []

  evalModal:Object = {
    asesor: '',
    contrato: '',
    nombre: '',
    manager: false,
    agent: false,
    superReview: false,
    new: false,
  }

  ctr:Object = {
    ctrs: []
  }

  constructor(public _api: ApiService,
      private titleService: Title,
      public _init:InitService,
      private _tokenCheck:TokenCheckService,
      private activatedRoute:ActivatedRoute,
      public toastr: ToastrService ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
      .subscribe( res => {

        if( res['status'] ){
          this.showContents = this._init.checkCredential( this.mainCredential, true )
        }else{
          this.showContents = false
          jQuery('#loginModal').modal('show');
        }
    })

    this.activatedRoute.params.subscribe( params => {
      if( params.asesor ){
        this.asesorSelected = params.asesor
        this.searchBy = 1
        this.searchEval()
      }
    });

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Evaluaciones Desempeño');
    this.getOps()
  }

  openEval( item, newFlag, asesor = false ){

    let manager = false, sup = false

    if( (this._init.checkSingleCredential('eval_desemp_gerencia') || this._init.checkSingleCredential('eval_desemp_evaluacion')) && !newFlag ){
      switch(parseInt(item['status'])){
        case 2:
          manager = this._init.checkSingleCredential('eval_desemp_gerencia')
          sup = false
          break
        case 3:
          manager = false
          sup = true
          break
        default:
          manager = false
          sup = false
          break
      }

    }



    this.evalModal = {
      asesor: item['asesor'],
      contrato: item['contrato'],
      nombre: item['Nombre'],
      manager: manager,
      agent: asesor,
      superReview: sup,
      new: newFlag,
      status: item['status'],
      left: this.getDuration( item['fin']+' 23:59:59', 'd', true ),
      openTime: moment()
    }
    jQuery('#desempeno').modal('show')
  }

  showEval( info ){
    this.evalModal = info
    jQuery('#desempeno').modal('show')
    jQuery('#desempeno').addClass('modal-open-important')
  }

  getOps(){
    this.loading['ops'] = true

    this._api.restfulGet( '','Rrhh/operaciones' )
              .subscribe( res => {

                this.loading['ops'] = false
                this.operaciones = res['data']

              }, err => {
                console.log('ERROR', err)

                this.loading['ops'] = false

                let error = err.error
                this.toastr.error( error.msg, err.statusText )
                console.error(err.statusText, error.msg)

              })
  }

  onDateSelection(date: NgbDateStruct, el ) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
    } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals(date, this.fromDate))) {
      this.toDate = date
      this.fin = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).format('DD/MM')} a ${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')}`)
      el.close()
      this.dateSelected = { inicio: this.inicio, fin: this.fin }
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
      this.fin = null
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  onSelected( event ){
    this.asesorSelected = event.asesor
  }

  searchEval(){
    let filters = {}

    switch(this.searchBy){
      case 1:
      case '1':
        if( this.asesorSelected == '' ){
          this.toastr.error('Debes seleccionar un asesor para hacer la búsqueda', 'Error')
          return false
        }

        filters = { asesor: this.asesorSelected }
        break
      case 2:
      case '2':
        if( this.opSelected == '' ){
          this.toastr.error('Debes seleccionar una operación para hacer la búsqueda', 'Error')
          return false
        }
        if( !this.dateSelected['inicio'] ){
          this.toastr.error('Debes seleccionar fechas para hacer la búsqueda', 'Error')
          return false
        }

        filters = {
          operacion: this.opSelected,
          inicio: this.dateSelected['inicio'],
          fin: this.dateSelected['fin']
        }
        break
      default:
        this.toastr.error('Debes seleccionar un tipo de  búsqueda', 'Error')
        return false
    }

    this.loading['evals'] = true

    this._api.restfulPut( filters,'Rrhh/evaluaciones' )
              .subscribe( res => {

                this.loading['evals'] = false
                this.evalsData = res['data']

              }, err => {
                console.log('ERROR', err)

                this.loading['evals'] = false

                let error = err.error
                this.toastr.error( error.msg, err.statusText )
                console.error(err.statusText, error.msg)

              })
  }

  btnColor( item ){
    if( parseInt(item['createNew']) == 1 ){
      return 'btn-success'
    }

    if( this._init.checkSingleCredential('eval_desemp_gerencia') || this._init.checkSingleCredential('eval_desemp_evaluacion') ){
      if( parseInt(item['status']) == 2 && this._init.checkSingleCredential('eval_desemp_gerencia') ){
        return 'btn-danger'
      }

      if( parseInt(item['status']) == 3 ){
        return 'btn-warning'
      }

    }

    return 'bg-info text-light'
  }

  getDuration( datetime, format='hms', normal = false ){
    let now   = moment()
    let unix

    if( !normal ){
      unix  = moment.unix(datetime)
    }else{
      now = moment(datetime)
      unix = moment.unix( parseInt(moment().format('X')))
    }

    let result = moment.duration(now.diff(unix));

    let days:any = Math.floor(result.asDays())
    let hours:any = Math.floor(result.asHours()) - (days * 24)
    let minutes:any = Math.floor(result.asMinutes()) - ( Math.floor(result.asHours()) * 60 )
    let seconds:any = Math.floor(result.asSeconds()) - ( Math.floor(result.asMinutes()) * 60 )

    if( hours < 10 ){ hours = `0${ hours }` }
    if( minutes < 10 ){ minutes = `0${ minutes }` }
    if( seconds < 10 ){ seconds = `0${ seconds }` }

    switch(format){
      case 'hms':
        return `${ days } dias, ${ hours }:${ minutes }:${ seconds }`
      case 'h':
        return Math.floor(result.asHours())
      case 'm':
        return Math.floor(result.asMinutes())
      case 's':
        return Math.floor(result.asSeconds())
      case 'd':
        return Math.floor(result.asDays())
    }
  }

  err( data ){
    this.toastr.error(data.msg, data.code)
  }

  succ( data ){
    if( !data.toastrOff ){
      this.toastr.success( 'Solicitud guardada correctamente', 'Guardado!')
    }
  }

  openContracts(item){

    this.ctr = {
      asesor: item['asesor'],
      Nombre: item['Nombre']
    }

    this.loading['ctrs'] = true

    this._api.restfulGet( item.asesor,'DetalleAsesores/contrato' )
              .subscribe( res => {

                this.loading['ctrs'] = false
                this.ctr['ctrs'] = res['data']['contratos']
                jQuery('#editContratos').modal('show')

              }, err => {
                console.log('ERROR', err)

                this.loading['ctrs'] = false
                let error = err.error
                this.toastr.error( error.msg, err.status )
                console.error(err.statusText, error.msg)

              })

  }



}

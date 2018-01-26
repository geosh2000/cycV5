import { Component, OnInit, ViewChild, ViewContainerRef, Input, ChangeDetectorRef } from '@angular/core';
import { PopoverModule } from 'ngx-popover';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/subject';

import { AddAusentismoComponent } from '../../formularios/add-ausentismo.component';
import { CumplimientoComponent } from '../../../addon/progress/cumplimiento/cumplimiento.component';
import { AsistenciaBadgeComponent } from '../../../addon/buttons/asistencia-badge/asistencia-badge.component';
import { PyaExceptionComponent } from '../../formularios/pya-exception.component';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';
import { TokenCheckService } from '../../../services/token-check.service';

import * as Globals from '../../../globals';
declare var jQuery:any;
// import * as moment from 'moment';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styles: ['input[type=checkbox]{ cursor: pointer}']
})
export class AsistenciaComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent
  @ViewChild( AddAusentismoComponent ) _aus: AddAusentismoComponent
  @ViewChild( CumplimientoComponent ) _progress: CumplimientoComponent
  @ViewChild( AsistenciaBadgeComponent ) _asist: AsistenciaBadgeComponent
  @ViewChild( PyaExceptionComponent ) _pya:PyaExceptionComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  loading:boolean = false
  showProgress:boolean = false

  asistData:any
  datesData:any
  deps:any

  private depsSubject = new Subject<any>();
  private asistSubject = new Subject<any>();

  orederedKeys:any
  shownDom:any = []

  showOpts:Object = {
    ch_jornada:   true,
    ch_comida:    false,
    ch_excep:     true,
    ch_ret:       false,
    ch_sa:        false,
    ch_x:        false,
    sh_p:        false,
    sh_d:        false
  }

  today:any = moment()

  searchCriteria:Object = {
    start:  this.today.subtract(15, 'days').format('YYYY-MM-DD'),
    end:    this.today.add(15, 'days').format('YYYY-MM-DD'),
    value:  '',
    skill:  ''
  }

  searchFilter:string = ''

  searchFields:any = [
    'Nombre', 'PuestoName', 'Departamento'
  ]

  error:string = null


  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastsManager,
                public vcr: ViewContainerRef,
                private cd: ChangeDetectorRef
                ) {

    this.toastr.setRootViewContainerRef(vcr)
    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
          }
        })

    this.searchCriteria['value']= `${this.searchCriteria['start']} - ${this.searchCriteria['end']}`

    this._dateRangeOptions.settings = {
      autoUpdateInput: true,
      locale: { format: "YYYY-MM-DD" }
    }

    this.loadDeps()

  }

  getAsistencia( dep, inicio, fin, asesor?:any ){

      this.searchFilter = ''
      let params = `${dep}/${inicio}/${fin}`

      if( asesor ){
        params = `${dep}/${inicio}/${fin}/${asesor}`
        this.asistData[asesor]['data'][inicio]['loading'] = true
      }else{
        this.loading = true
      }

      this._api.restfulGet( params, 'Asistencia/pya' )
              .subscribe( res =>{

                if( asesor ){
                  // console.log( res )
                  this.singleUpdate( res )
                }else{
                  this.asistSubject.next({ res })
                }

              },
                (err) => {
                  this.error = err
                  this.loading = false
                  this.toastr.error(`${ this.error }`, 'Error!');
              });


  }

  singleUpdate( data ){
    for( let asesor in data.data ){
      for(let fecha in data.Fechas ){
        this.asistData[ asesor ]['data'][ fecha ] = data.data[ asesor ][ 'data' ][ fecha ]
      }
    }

  }

  compareDates( date ){
    let header = moment(date)
    let td = moment( this.today.format('YYYY-MM-DD') )

    if(header >= td){
      return false
    }else{
      return true
    }

  }

  loadDeps(){
    this._api.restfulGet( '','Headcount/deps' )
            .subscribe( res => {
              this.depsSubject.next({ res })
            })
  }

  @Input() loadData(): Observable<any>{
    return this.asistSubject.asObservable();
  }

  @Input() getDeps(): Observable<any>{
    return this.depsSubject.asObservable();
  }


  setVal( inicio, fin ){
    this.searchCriteria['start'] = inicio.format('YYYY-MM-DD')
    this.searchCriteria['end'] = fin.format('YYYY-MM-DD')
  }

  pcrcChange( select ){
    this.searchCriteria['skill']=event.target['value']
  }

  applyFilter( rac ){


    if(this.searchFilter == ''){
      return true
    }

    for(let item of this.searchFields){
      if(rac[item].toLowerCase().includes(this.searchFilter.toLowerCase())){
        return true
      }
    }

    return false
  }


  ngOnInit() {

    this.getDeps()
        .subscribe( res => {
          this.deps = res.res
          // console.log( res.res )
          this.cd.markForCheck()
        })

    this.loadData()
        .subscribe( res => {
          this.asistData = res.res['data']
          this.datesData = res.res['Fechas']
          this.orderNames( this.asistData, 1)
          this.loading = false

          // console.log( res.res )
          // console.log( this.asistData )
          this.cd.markForCheck()
        })
  }

  printTimeInterval(date, start, end){
    let inicio =    moment.tz(`${date} ${start}`, "America/Mexico_City")
    let fin =       moment.tz(`${date} ${end}`, "America/Mexico_City")
    let inicioCUN = inicio.clone().tz("America/Bogota")
    let finCUN =    fin.clone().tz("America/Bogota")

    let result = `${inicioCUN.format('HH:mm')} - ${finCUN.format('HH:mm')}`

    return result
  }

  printTime(date, time){
    let tiempo =    moment.tz(`${date} ${time}`, "America/Mexico_City")
    let tiempoCUN =    tiempo.clone().tz("America/Bogota")

    let result = tiempoCUN.format('HH:mm:ss')

    return result
  }

  formatDate(datetime, format){
    let time = moment.tz(datetime, "America/Mexico_City")
    let cunTime = time.clone().tz("America/Bogota")

    return cunTime.format(format)
  }

  orderNames( data, ord=1 ){

    // console.log(data)

    let sortArray:any   = []
    let tmpSlot:any     = []
    let flag:boolean
    let pushFlag:boolean
    let x:number
    let lastInput:any
    let compare:any = []

    for(let id in data){
      if(sortArray.length == 0){
        sortArray[0] = id
      }else{
        flag = false
        for(x=0; x<sortArray.length; x++){
          if(!flag){

            if(ord == 1){
              compare[1] = data[id]['Nombre']
              compare[2] = data[sortArray[x]]['Nombre']
            }else{
              compare[1] = data[sortArray[x]]['Nombre']
              compare[2] = data[id]['Nombre']
            }
            if(compare[1] < compare[2]){
              tmpSlot[0]      = sortArray[x]
              sortArray[x]    = id
              flag            = true

              if(x == (sortArray.length)-1){
                pushFlag=true
                lastInput = tmpSlot[0]
              }
            }else{
              if(x == (sortArray.length)-1){
                pushFlag=true
                lastInput = id
              }
            }
          }else{
            tmpSlot[1]      = sortArray[x]
            sortArray[x]    = tmpSlot[0]
            tmpSlot[0]      = tmpSlot[1]
          }
        }

        if(pushFlag){
          sortArray.push(lastInput)
        }
      }

    }

    this.orederedKeys = sortArray
  }

  ausentNotif( event ){
    this.toastr.error(`${ event.msg }`, `${ event.title.toUpperCase() }!`);
  }

  perCumplimiento( rac, date, log ){

    let inicio = this.asistData[rac].data[date][`${log}s`]
    let fin    = this.asistData[rac].data[date][`${log}e`]
    let ji     = this.asistData[rac].data[date][`${log}_login`]
    let jf     = this.asistData[rac].data[date][`${log}_logout`]

    if( inicio == null  ||
        fin == null     ||
        ji == null      ||
        jf == null ){
      return 0
    }

    let s   = moment( inicio )
    let e   = moment( fin )
    let js  = moment( ji )
    let je  = moment( jf )

    let total = e.diff(s, 'seconds')

    let did = je.diff(js, 'seconds')
    let result:number = did / total * 100
    return (Math.floor(result))
  }

  timeDateXform( time ){
    let td = moment(time)
    if( td < moment(`${moment().format('YYYY-MM-DD')} 05:00:00`)){
      return td.add(1, 'days')
    }else{
      return td
    }
  }

  showDom(rac, date, block){
    if(this.checkSet(rac, date, block)){
      this.shownDom[`${rac}_${date}_${block}`] = undefined
    }else{
      this.shownDom[`${rac}_${date}_${block}`] = true
    }
  }

  checkSet(rac, date, block){
    if(this.isset(this.shownDom,`${rac}_${date}_${block}`)){
      return true
    }else{
      return false
    }
  }

  isset (a, name ) {
    let is = true
    if ( a[name] === undefined || a[name] === "" || a[name] === null ) {
            is = false
        }
    return is;
  }

  progressProps( val, originalBg = 'primary' ){

    let bar: string
    let border: string

    if(val<60){
      bar    = 'danger'
    }else if(val<100){
      bar    = 'warning'
    }else{
      bar    = 'success'
    }

    if(originalBg == bar){
      border = 'light'
    }else{
      border = bar
    }

    return {bar: bar, border: border, val: val}
  }


  excStatus( event ){
    if( !event.status ){
      let error = event.error.json()
      this.toastr.error( error.msg, `Error ${event.error.status} - ${event.error.statusText}` )

      if( error.Existente ){
        console.error("Ausentismo existente: ", error.Existente)
      }

      if( error.errores ){
        console.error("Ausentismo existente: ", error.errores)
      }
    }else{
      this.toastr.success( event.error.msg, `Guardado` )
      this.getAsistencia( this.searchCriteria['skill'], event.fecha, event.fecha, event.asesor )

    }
  }

}

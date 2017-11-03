import { Component, OnInit, ViewChild, ViewContainerRef, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { PopoverModule } from 'ngx-popover';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { AddAusentismoComponent } from '../../formularios/add-ausentismo.component';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

import * as Globals from '../../../globals';
declare var jQuery:any;
// import * as moment from 'moment';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsistenciaComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent
  @ViewChild( AddAusentismoComponent ) _aus: AddAusentismoComponent

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
                public toastr: ToastsManager,
                public vcr: ViewContainerRef,
                private cd: ChangeDetectorRef
                ) {

    this.toastr.setRootViewContainerRef(vcr)
    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.searchCriteria['value']= `${this.searchCriteria['start']} - ${this.searchCriteria['end']}`

    this._dateRangeOptions.settings = {
      autoUpdateInput: true,
      locale: { format: "YYYY-MM-DD" }
    }

    this.loadDeps()

  }

  getAsistencia( dep, inicio, fin ){


      this.loading = true
      this.searchFilter = ''

      this._api.restfulGet( `${dep}/${inicio}/${fin}`, 'Asistencia/pya' )
              .subscribe( res =>{

                this.asistSubject.next({ res })

              },
                (err) => {
                  this.error = err
                  this.loading = false
                  this.toastr.error(`${ this.error }`, 'Error!');
              });


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
          console.log( res.res )
          this.cd.markForCheck()
        })

    this.loadData()
        .subscribe( res => {
          this.asistData = res.res['data']
          this.datesData = res.res['Fechas']
          this.orderNames( this.asistData, 1)
          this.loading = false

          console.log( res.res )
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

  orderNames( data, ord=1 ){

    console.log(data)

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

  perCumplimiento( rac, date, set, log ){

    let inicio = this.asistData[rac].data[date][`${set} start`]
    let fin    = this.asistData[rac].data[date][`${set} end`]
    let ji     = this.asistData[rac].data[date][`${log}_login`]
    let jf     = this.asistData[rac].data[date][`${log}_logout`]


    if( inicio == null  ||
        fin == null     ||
        ji == null      ||
        jf == null ){
      return 0
    }

    let s   = this.timeDateXform( inicio )
    let e   = this.timeDateXform( fin )
    let js  = this.timeDateXform( ji )
    let je  = this.timeDateXform( jf )

    let total = e.diff(s, 'seconds')
    let did = je.diff(js, 'seconds')
    let result:number = did / total * 100
    return (Math.floor(result))
  }

  timeDateXform( time ){
    let td = moment(`${moment().format('YYYY-MM-DD')} ${time}`)
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

}

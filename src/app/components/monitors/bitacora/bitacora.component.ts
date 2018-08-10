import { Component, OnInit, OnDestroy, Injectable, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

import { OrderPipe } from 'ngx-order-pipe';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { BitacoraAddActionComponent } from './bitacora-add-action/bitacora-add-action.component';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
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

            .ng-invalid {
              border: 1px solid red;
            }
  `]
})
export class BitacoraComponent implements OnInit {

  @ViewChild(BitacoraAddActionComponent) _add:BitacoraAddActionComponent

  mainCredential: any = 'monitor_gtr'
  showContents: boolean;
  currentUser: any;

  loading:Object = {}
  data:any
  lu:any

  selectedDate:any
  viewDep:any = 35
  listDeps:any = []

  timeToReload:any  = 300
  timerCount:any    = this.timeToReload
  timeout:any

  constructor(
        private _api:ApiService,
        private _init:InitService,
        private titleService: Title,
        private _tokenCheck:TokenCheckService,
        public toastr: ToastrService,
        private op: OrderPipe,
        private _zh:ZonaHorariaService
        ) {

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

    moment.locale('es-MX')

    this.selectedDate = moment().format('YYYY-MM-DD')
    jQuery('#picker').val(`${moment().format('DD MMM \'YY')}`)
    }

  ngOnInit() {
    this.titleService.setTitle('CyC - Bitácora GTR');
    this.getData();
    this.timerLoad();
    // console.log(this.testData)
    // console.log(JSON.stringify(this.testData))
    // console.log(JSON.parse(JSON.stringify(this.testData)))
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getData( skill = this.viewDep ){
    this.loading['data'] = true

    this._api.restfulGet( `${this.selectedDate}/${skill}`, 'Bitacoras/bitacora')
    .subscribe( res => {

      this.loading['data'] = false
      let data = res['data']
      let result = {}
      let listDeps = []

      for( let item of data ){
        item['comments'] = item['comments'] == null ? [] : JSON.parse(item['comments'])

        item['metas'] = item['metas'] == null ? [] : item['metas'][item['Skill']] ? JSON.parse(item['metas']) : []

        if( result[item['Skill']] ){
          result[item['Skill']][item['HG']] = item
        }else{
          listDeps.push({dep: item['Depto'], skill: item['Skill']})
          result[item['Skill']] = {
            [item['HG']]: item
          }
        }
      }

      this.data = result
      this.listDeps = listDeps
      // console.log(result)

    }, err => {
      console.log('ERROR', err)
      this.loading['data'] = false
      let error = err.json()
      this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
      console.error(err.statusText, error.msg)
    })
  }

  formatCell(val, div, ref, compare, thresA, thresB, thresC, noO = false){

    let divisor = div ? 100 : 1

    if(noO && parseFloat(val) == 0){
      return 'bg-danger'
    }

    if( !val || ref == 0 || val == null ){
        return ''
    }

    switch(compare){
      case '>':
        if( parseFloat(val)/divisor > (parseFloat(ref)*(thresA)) ){
          return 'bg-success'
        }else{
            if( parseFloat(val)/divisor > (parseFloat(ref)*(thresB)) ){
              return ''
            }else{
                if( parseFloat(val)/divisor > (parseFloat(ref)*(thresC)) ){
                  return 'bg-warning'
                }else{
                  return 'bg-danger'
                }
            }
        }
      case '<':
        if( parseFloat(val)/divisor > (parseFloat(ref)*(thresA)) ){
          if( parseFloat(val)/divisor > (parseFloat(ref)*(thresB)) ){
            if( parseFloat(val)/divisor > (parseFloat(ref)*(thresC)) ){
              return 'bg-danger'
            }else{
              return 'bg-warning'
            }
          }else{
            return ''
          }
        }else{
          return 'bg-success'
        }
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
    let selected = moment({year: date.year, month: date.month-1, day: date.day})
    this.selectedDate = selected.format('YYYY-MM-DD')

    jQuery('#picker').val(`${selected.format('DD MMM \'YY')}`)
    this.getData()
    el.close()
  }

  timerLoad(){
    if( this.timerCount == 0 ){
      this.getData()
      this.timerCount = this.timeToReload
    }else{
      this.timerCount--
    }

    this.timeout = setTimeout( () => this.timerLoad(), 1000 )

  }

  savedComment( item ){
    // console.log(item)
    this.data[item['skill']][item['hg']]['comments'][item['level']] = item
  }

  deleteComment( item ){
    // console.log(item)
    this.data[item['skill']][item['hg']]['comments'][item['level']] = null
  }

  editLevel( input ){
    let params = {
      Fecha: input[0],
      skill: input[1],
      hg: input[2],
      level: input[3]
    }
    // console.log(params)
    this._add.build( params )
  }

}

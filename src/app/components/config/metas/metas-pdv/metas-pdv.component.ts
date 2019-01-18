import { Component, OnInit, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';
import { EasyTableServiceService } from '../../../../services/easy-table-service.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { ActivatedRoute } from '@angular/router';
// import { Columns } from 'ngx-easy-table/ngx-easy-table';

@Component({
  selector: 'app-metas-pdv',
  templateUrl: './metas-pdv.component.html',
  styles: []
})
export class MetasPdvComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'pdv_metas_upload'

  loading:Object = {}
  years:any = []

  monthSelected:any = parseInt(moment().format('MM'))
  yearSelected:any = parseInt(moment().format('YYYY'))
  paisSelected:any = 'MX'
  statusSelected:any = 1

  data:any = []
  originalData:any = []
  config:EasyTableServiceService
  columns:any = [
    { type: 'default', key: 'PDV', title: 'PDV' },
    { type: 'default', key: 'displayNameShortOk', title: 'Nombre' },
    { type: 'default', key: 'Ciudad', title: 'Ciudad' },
    { type: 'badge', key: 'Activo', title: 'Status' },
    { type: 'input', key: 'plazas', title: '# Asesores' },
    { type: 'input', key: 'meta_total', title: 'Meta Total' },
    { type: 'input', key: 'meta_hotel', title: 'Meta Hotel' },
    { type: 'input', key: 'meta_total_diaria', title: 'Meta Total por día' },
    { type: 'input', key: 'meta_hotel_diaria', title: 'Meta Hotel por día' },
    { type: 'button', key: 'save', title: 'Guardar' }
  ]

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

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Metas PDV');
    this.config =  EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true
    this.buildYears()
  }

  buildYears(){
    for( let i = moment('2018-01-01'); i < moment().add(1, 'year'); i.add(1,'year') ){
      this.years.push( parseInt(i.format('YYYY')) )
    }
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.paisSelected}/${this.monthSelected}/${this.yearSelected}/${this.statusSelected}`, 'Lists/pdvMetas')
        .subscribe( res => {

          this.loading['data'] = false
          this.originalData = JSON.parse(JSON.stringify(res['data']))
          let data = res['data']

          for( let item of data ){
            item['meta_total'] = parseFloat(item['meta_total'] ? item['meta_total'] : 0).toLocaleString('es-MX')
            item['meta_hotel'] = parseFloat(item['meta_hotel'] ? item['meta_hotel'] : 0).toLocaleString('es-MX')
            item['meta_total_diaria'] = parseFloat(item['meta_total_diaria'] ? item['meta_total_diaria'] : 0).toLocaleString('es-MX')
            item['meta_hotel_diaria'] = parseFloat(item['meta_hotel_diaria'] ? item['meta_hotel_diaria'] : 0).toLocaleString('es-MX')
          }

          this.data = data

        }, err => {
          console.log('ERROR', err)
          this.loading['data'] = false
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)
        })
  }

  editAmmount( row ){

    let oldVal = {}

    let i = 0, index = 0
    for( let item of this.originalData ){
      if( item['id'] == row['id'] ){
        oldVal['meta_total'] = parseFloat(item['meta_total']).toLocaleString('es-MX')
        oldVal['meta_hotel'] = parseFloat(item['meta_hotel']).toLocaleString('es-MX')
        oldVal['meta_total_diaria'] = parseFloat(item['meta_total_diaria']).toLocaleString('es-MX')
        oldVal['meta_hotel_diaria'] = parseFloat(item['meta_hotel_diaria']).toLocaleString('es-MX')
        oldVal['plazas'] = parseInt(item['plazas'])

        index = i
      }
      i++
    }

    this.data[index]['save'] = true

    let params = {
      pdv: row['id'],
      mes: row['mes'],
      anio: row['anio'],
      asesores: row['plazas'],
      meta_total: parseFloat(row['meta_total'].replace(/[^0-9\.]+/g, '')),
      meta_hotel: parseFloat(row['meta_hotel'].replace(/[^0-9\.]+/g, '')),
      meta_total_diaria: parseFloat(row['meta_total_diaria'].replace(/[^0-9\.]+/g, '')),
      meta_hotel_diaria: parseFloat(row['meta_hotel_diaria'].replace(/[^0-9\.]+/g, ''))
    }

    this._api.restfulPut( params, 'Config/pdvMetaEdit')
        .subscribe( res => {

          this.data[index]['save'] = false
          this.data[index]['error'] = false
          this.data[index]['success'] = true
          this.toastr.success( 'Guardado' )

        }, err => {
          row['meta_hotel'] = oldVal['meta_hotel']
          row['meta_hotel_diaria'] = oldVal['meta_hotel_diaria']
          row['meta_total_diaria'] = oldVal['meta_total_diaria']
          row['meta_total'] = oldVal['meta_total']
          row['plazas'] = oldVal['plazas']

          console.log('ERROR', err)
          this.data[index]['save'] = false
          this.data[index]['success'] = false
          this.data[index]['error'] = true
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)

        })
  }

  editDaily( row, key, valOk ){

    let days = parseInt(moment(`${row['anio']}-${row['mes']}-01`).add(1, 'month').subtract(1,'day').format('DD'))
    let val = parseFloat(valOk.replace(/[^0-9\.]+/g, ''))

    if( val <= 0 ){
      row[`${key}_diaria`] = 0
    }else{
      row[`${key}_diaria`] = (val / days).toLocaleString( 'es-MX' )
    }

    row[key] = val.toLocaleString( 'es-MX' )

    return true
  }

}

import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
import { CxcPayDetailComponent } from '../cxc-pay-detail/cxc-pay-detail.component';

@Component({
  selector: 'app-cxc-admin',
  templateUrl: './cxc-admin.component.html',
  styles: [],
})
export class CxcAdminComponent implements OnInit {

  @ViewChild(CxcPayDetailComponent) _detail:CxcPayDetailComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'cxc_apply'

  pdvSearch:boolean = false

  loading:Object = {
    linkcxc: {},
    save: false
  }

  data:any = []
  cortesList:any = []
  modif:Object = {}

  selectedPayday:any

  params:Object = { id: '', nuevoMonto: '', item: {}}

  constructor(public _api: ApiService,
                public _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                private route:Router,
                private activatedRoute:ActivatedRoute,
                public toastr: ToastrService) {

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
      if( params.id ){
        // this.selected['id']     = params.id
      }
    });
  }

  curPayDay( date ){
    if( parseInt(moment(date).format('DD')) > 3 && parseInt(moment(date).format('DD')) < 19 ){
      return moment(date).endOf('month').format('YYYY-MM-DD')
    }else{
      if( parseInt(moment(date).format('DD')) <= 3 ){
        return moment(date).format('YYYY-MM-15')
      }else{
        return moment(date).add(1,'months').format('YYYY-MM-15')
      }
    }
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Administración CXC');
    this.getCortes()
    this.selectedPayday = this.curPayDay(moment().format('YYYY-MM-DD'))
  }

  getCortes(){

    this.loading['cortes'] = true

    this._api.restfulGet( '', `Nomina/cortesNomina`)
          .subscribe( res => {

            this.loading['cortes'] = false
            this.cortesList = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['cortes'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })

  }

  getData(){

    this.loading['data'] = true

    this._api.restfulGet( this.selectedPayday, `Cxc/cxcCorte`)
          .subscribe( res => {

            this.loading['data'] = false
            this.data = res['data']

          }, err => {

            console.log('ERROR', err)

            this.loading['data'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })

  }

  desactivar( item, flag ){
    let params = {}, nuevoMonto

    console.log(item)

    if( flag ){
      params['statusChange'] = 1
      params['status'] = 0
      params['id'] = item['id']
      params['cxcId'] = item['cxcId']
      params['payday'] = item['payday']
      params['montoRestante'] = (parseFloat(item['montoQuincena'])).toFixed(2)
      nuevoMonto = 0
    }else{
      nuevoMonto = ((parseFloat(item['montoPendiente']) < parseFloat(item['montoParcialidades']) ? parseFloat(item['montoPendiente']) : parseFloat(item['montoParcialidades']))).toFixed(2)
      params['statusChange'] = 1
      params['status'] = 1
      params['id'] = item['id']
      params['cxcId'] = item['cxcId']
      params['payday'] = item['payday']
      params['montoRestante'] = (nuevoMonto * (-1)).toFixed(2)
    }

    this.editAmount(item, nuevoMonto, params)
  }

  editAmount( item, nuevoMonto, params? ){
    this.loading['save'] = true

    if( !params ){
      params = {}
      params['statusChange'] = 0
      params['status'] = 1
      params['id'] = item['id']
      params['cxcId'] = item['cxcId']
      params['payday'] = item['payday']
      params['montoRestante'] = (parseFloat(item['montoQuincena']) - nuevoMonto).toFixed(2)
    }

    params['nuevoMonto'] = nuevoMonto

    this._api.restfulPut( params, `Cxc/editPayment`)
          .subscribe( res => {

            this.loading['save'] = false
            this.toastr.success(res['msg'], 'Guardado')
            this.getData()
            jQuery('#editAmountModal').modal('hide')

          }, err => {

            console.log('ERROR', err)

            this.loading['save'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })


  }

  modificar( item ){
    this.modif['id'] = item['id']
    this.modif['nuevoMonto'] = parseFloat(item['montoQuincena']).toFixed(2)
    this.modif['montoQuincena'] = parseFloat(item['montoQuincena']).toFixed(2)
    this.modif['top'] = parseFloat(item['montoParcialidades']).toFixed(2)
    this.modif['montoPendiente'] = parseFloat(item['montoPendiente']).toFixed(2)
    this.modif['montoTotalCxc'] = parseFloat(item['montoTotalCxc']).toFixed(2)
    this.modif['item'] = item
    jQuery('#editAmountModal').modal('show')
  }

  saveAmount(){
    if( this.modif['nuevoMonto'] < 0 ){
      this.toastr.error( 'El monto no puede ser negativo', 'Error' )
      return false
    }

    if( this.modif['nuevoMonto'] > this.modif['top'] ){
      this.toastr.error( 'El monto máximo para este cxc es de $'+this.modif['top'], 'Error' )
      return false
    }

    if( this.modif['nuevoMonto'] > this.modif['montoPendiente'] ){
      this.toastr.error( 'El monto pendiente $'+this.modif['top']+'. No es posible asignar un monto mayor', 'Error' )
      return false
    }

    if( this.modif['nuevoMonto'] == 0 ){
      this.desactivar( this.modif['item'], true )
      return true
    }

    this.editAmount( this.modif['item'], this.modif['nuevoMonto'] )

  }

}

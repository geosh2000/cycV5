import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

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
  selectedDep:any = 0

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

    this._api.restfulGet( `${this.selectedPayday}/${this.selectedDep}`, `Cxc/cxcCorte`)
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

    this.deactivate(item, nuevoMonto, params)
  }

  deactivate( item, nuevoMonto, params? ){
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

    this._api.restfulPut( params, `Cxc/deactivate`)
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

    // if( this.modif['nuevoMonto'] > this.modif['top'] ){
    //   this.toastr.error( 'El monto máximo para este cxc es de $'+this.modif['top'], 'Error' )
    //   return false
    // }

    if( this.modif['nuevoMonto'] > this.modif['montoPendiente'] ){
      this.toastr.error( 'El monto pendiente $'+this.modif['montoPendiente']+'. No es posible asignar un monto mayor', 'Error' )
      return false
    }

    if( this.modif['nuevoMonto'] == 0 ){
      this.desactivar( this.modif['item'], true )
      return true
    }

    this.editAmount( this.modif['item'], this.modif['nuevoMonto'] )

  }

  download(){
    this.loading['download'] = true

    this._api.restfulGet( `${this.selectedPayday}/${this.selectedDep}`, `Cxc/downloadCxcAdmin`)
          .subscribe( res => {

            this.loading['download'] = false
            this.downloadXLS( 'cxcLayout', 'cxcLayout_' + this.selectedPayday + (this.selectedDep == 29 ? '_PDV' : 'CC'), res['data'] )

          }, err => {

            console.log('ERROR', err)

            this.loading['download'] = false

            let error = err.json()
            this.toastr.error( error.msg, err.statusText )
            console.error(err.statusText, error.msg)

          })
  }

  downloadXLS( sheets, title, json ){
    let wb:any

    wb = { SheetNames: ['scxc', 'reservas', 'saldos'], Sheets: {} };
    // wb.SheetNames.push(title);
    wb.Sheets['scxc'] = utils.json_to_sheet(json['scxc'], {cellDates: true});
    wb.Sheets['reservas'] = utils.json_to_sheet(json['reservas'], {cellDates: true});
    wb.Sheets['saldos'] = utils.json_to_sheet(json['saldos'], {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

}

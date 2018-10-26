import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cxc-aprobe',
  templateUrl: './cxc-aprobe.component.html',
  styles: []
})
export class CxcAprobeComponent implements OnInit {

  @Output() save = new EventEmitter

  item:any
  loading:Object = {}

  id:any
  montoFiscal:any
  monto:any
  currency:any
  asesor:any
  pagos:any
  montoParcial:any

  firstPay:any

  datesList:any = []


  constructor( private _api: ApiService, private toastr: ToastrService ) {
    this.buildDates()
  }

  ngOnInit() {
  }

  buildDates(){
    let start, index = 0

    if( parseInt( moment().format('DD') ) <= 10 ){
      start = moment().format('YYYY-MM-15')
    }else if( parseInt( moment().format('DD') ) <= 25 ){
      start = moment( moment().format('YYYY-MM-01') ).add(1,'months').subtract(1, 'days').format('YYYY-MM-DD')
    }else{
      start = moment( moment().format('YYYY-MM-01') ).add(1,'months').format('YYYY-MM-15')
    }

    for( let i = moment(start); i<moment().add(5, 'months'); i.add(1, 'days') ){
      i = this.dateBuilder(i)
      this.datesList.push( i.format('YYYY-MM-DD') )
      index++
    }

    this.firstPay = start
  }

  dateBuilder( m ){
    let date = m.clone()

    if( parseInt(date.format('DD')) == 15 || parseInt(date.format('DD')) == 1 ){
      return moment(date.format('YYYY-MM-15'))
    }else{
      return date.endOf('month')
    }
  }

  build( item ){
    this.item = item
    this.id = item['cxcIdLink']
    this.montoFiscal = parseFloat(item['totalCxc']).toFixed(2)
    this.asesor = item['asesorId']

    this.pagos = 1
    this.montoParcial = parseFloat(item['totalCxc']).toFixed(2)

    jQuery('#aprobeModal').modal('show')

  }

  calculateParcial( val ){
    this.montoParcial = val == 0 ? 0 : (this.montoFiscal / val).toFixed(2)
  }

  chgPay( flag ){
    if( flag ){
      if( this.pagos == 15 ){
        return true
      }else{
        this.pagos++
        this.calculateParcial(this.pagos)
      }
    }else{
      if( this.pagos == 1 ){
        return true
      }else{
        this.pagos--
        this.calculateParcial(this.pagos)
      }
    }
  }

  buildPayments(){

    this.loading['save'] = true

    let result = [], dayFact = 1, date = moment(this.firstPay)

    for( let i = 0; i < this.pagos; i++ ){
      date = this.dateBuilder(date)
      let arr = {
        payday: date.format('YYYY-MM-DD'),
        montoParcial: this.montoParcial,
        montoFiscal: this.montoFiscal,
        cxcId: this.id,
        asesor: this.asesor,
        consecutivo: i+1
      }

      result.push( arr )

      date.add(1, 'days')
    }

    this._api.restfulPut( result, `Cxc/apply`)
          .subscribe( res => {

            this.loading['save'] = false
            this.save.emit({status: true, id: this.id})
            jQuery('#aprobeModal').modal('hide')

          }, err => {

            console.log('ERROR', err)

            this.loading['save'] = false

            let error = err.error
            this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
            console.error(err.statusText, error.msg)

          })

  }

}

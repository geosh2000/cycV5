import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import * as moment from 'moment-timezone';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

@Component({
  selector: 'app-cuartiles',
  templateUrl: './cuartiles.component.html',
  styles: []
})
export class CuartilesComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  currentUser:any

  searchStart:any
  searchEnd:any

  loading:Object = {}

  pcrcList:any
  pcrcSelected:any
  par:Object = {
    SV: true,
    Paq: false
  }

  cData:any
  cSes:any
  allData:any
  builtData:any

  tableConfig

  constructor(
                private _api:ApiService,
                private _init:InitService,
                private titleService: Title,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService
                ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
          }
        })

    moment.locale('es-MX')

    let show = this.par['Paq']
    let t_sh = this.pcrcSelected == 50 ? true : false


  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Cuartiles');
    this.getPcrcs()
  }

  getPcrcs(){
    this.loading['pcrcs'] = true

    this._api.restfulGet( '', 'Cuartiles/pcrcs' )
            .subscribe( res => {

              this.loading['pcrcs'] = false
              this.pcrcList = res['data']


            }, err => {
              console.log("ERROR", err)

              this.loading['pcrcs'] = false

              let error = err.error
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  getCuartiles(){
    this.loading['cuartiles'] = true

    this._api.restfulGet( `${this.searchStart}/${this.searchEnd}/${this.pcrcSelected}/${this.par['SV']}/${this.par['Paq']}`, 'Cuartiles/cuartiles' )
            .subscribe( res => {

              this.loading['cuartiles'] = false
              this.cData = res['data']
              this.allData = res['meta']['raw']
              this.build(res['data'], res['meta']['avgSes'])

            }, err => {
              console.log("ERROR", err)

              this.loading['cuartiles'] = false

              let error = err.error
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)

            })
  }

  downloadXLS( sheets, title, json ){
    let wb:any

    wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push(title);
    wb.Sheets[title] = utils.json_to_sheet(json, {cellDates: true});

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  opVal( operator, values, data ){

    let dataA = data[values[0]] ? data[values[0]] : 0
    let dataB = data[values[1]] ? data[values[1]] : 0

    switch(operator){
      case "/":
        if(dataB == 0){
          return 0
        }
        return parseFloat(dataA)/parseFloat(dataB)
      case "*":
        return parseFloat(dataA)*parseFloat(dataB)
      case "+":
        return parseFloat(dataA)+parseFloat(dataB)
      case "-":
        return parseFloat(dataA)-parseFloat(dataB)
    }
  }

  showData(item, op, value, type){
    if( op == null ){
      return item[value] ? item[value] : (type == 'text' ? '' : 0)
    }else{
      return this.opVal( op, value, item )
    }
  }

  build( data, avgSes ){
    this.tableConfig = [
      { show: true, op: null, field: 'asesor',          t: 'Asesor',          type: 'text',   class: 'text-left font-weight-bold' },
      { show: true, op: null, field: 'supervisor',      t: 'Supervisor',      type: 'text',   class: 'text-left' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: 'Monto',           t: 'Monto',           type: '$',      class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: ['monto','Monto',true], t: 'QMonto',          type: 'q',      class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: 'Hotel_All',       t: 'Monto Hotel',     type: '$',      class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: ['hotel','Monto Hotel',true], t: 'QMonto Hotel',    type: 'q',      class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: 'Paquete_All',     t: 'Monto Paquete',   type: '$',    class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: 'Transfer_All',    t: 'Monto Transfer',  type: '$',    class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: ['transfer','Monto Transfer',true], t: 'QMonto Transfer', type: 'q',     class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: 'Tour_All',        t: 'Monto Tour',      type: '$',      class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: ['tour','Monto Tour',true], t: 'QMonto Tour',     type: 'q',       class: 'text-right' },
      { show: this.pcrcSelected == 6 ? false : true, op: null, field: 'LocsIn',          t: 'Locs In',         type: 'num',    class: 'text-center' },
      { show: true, op: null, field: 'callsIn',         t: 'Calls In',        type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected == 6 ? false : true, op: "/",  field: ['LocsIn', 'callsIn'], t: 'FC',          type: '%',      class: 'text-right' },
      { show: true, op: null, field: ['fc','FC',true],       t: 'QFC',             type: 'q',       class: 'text-right' },
      { show: true, op: "/",  field: ['TTIn', 'callsIn'], t: 'AHT In',        type: 'dec',    class: 'text-right' },
      { show: true, op: null, field: ['ahtIn','AHT In',false],  t: 'QAHT In',         type: 'q',     class: 'text-right' },
      { show: true, op: null, field: 'LocsNotIn',         t: 'Locs Out',        type: 'num',    class: 'text-center' },
      { show: true, op: null, field: 'callsOut',        t: 'Calls Out',       type: 'num',    class: 'text-center' },
      { show: true, op: "/",  field: ['TTOut', 'callsOut'], t: 'AHT Out',     type: 'dec',  class: 'text-right' },
      { show: true, op: null, field: ['ahtOut','AHT Out',false],  t: 'QAHT Out',        type: 'q',   class: 'text-right' },
      { show: true, op: null, field: 'intentosOut',     t: 'Intentos Out',    type: 'num',    class: 'text-center' },
      { show: true, op: null, field: 'Sesion',          t: 'Tiempo Sesión',   type: 'num',   class: 'text-center' },
      { show: true, op: "/",  field: ['Ut', 'Sesion'],  t: 'Utilizacion',     type: '%',     class: 'text-right' },
      { show: true, op: null, field: 'pausasExcedidas', t: 'Pausas Excedidas',type: 'num', class: 'text-center' },
      { show: true, op: null, field: ['exceed','Pausas Excedidas',false], t: 'QPausas Excedidas',type: 'q', class: 'text-center' },
      { show: true, op: null, field: 'FA',              t: 'Fa',              type: 'num', class: 'text-center' },
      { show: true, op: null, field: 'RTA',              t: 'RT-A',              type: 'num', class: 'text-center' },
      { show: true, op: null, field: 'RTB',              t: 'RT-B',              type: 'num', class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['Mailing_Total','Mailing'],        t: 'Eficiencia Mailing',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['Confirming_Total','Confirming'],        t: 'Eficiencia Confirming',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['Reembolsos_Total','Reembolsos'],        t: 'Eficiencia Reembolsos',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['MC_Total','MejoraContinua'],        t: 'Eficiencia Mejora<br>Continua',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['Afectaciones_Total','Afectaciones'],        t: 'Eficiencia Afectaciones',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['AgenciasConfirming_Total','AgenciasConfirming'],        t: 'Eficiencia Agencias<br>Confirming',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: '/', field: ['AgenciasMejora'],        t: 'Eficiencia Agencias<br>Mejora',       type: 'dec',    class: 'text-right' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Confirming_FinBO',        t: 'Confirming FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Confirming_FinIN',        t: 'Confirming FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Confirming_Total',        t: 'Confirming Total',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Mailing_Escalado',        t: 'Mailing Escalado',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Mailing_FinBO',        t: 'Mailing FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Mailing_FinIN',        t: 'Mailing FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Mailing_Total',        t: 'Mailing Total',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'MC_FinBO',        t: 'MC FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'MC_FinIN',        t: 'MC FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'MC_Total',        t: 'MC Total',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Reembolsos_FinBO',        t: 'Reembolsos FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Reembolsos_FinIN',        t: 'Reembolsos FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Reembolsos_Total',        t: 'Reembolsos Total',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'AgenciasConfirming_FinBO',        t: 'AgenciasConfirming FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'AgenciasConfirming_FinIN',        t: 'AgenciasConfirming FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'AgenciasConfirming_Total',        t: 'AgenciasConfirming Total',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'AgenciasMejora_FinBO',        t: 'AgenciasMejora FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'AgenciasMejora_FinIN',        t: 'AgenciasMejora FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'AgenciasMejora_Total',        t: 'AgenciasMejora Total',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Afectaciones_FinBO',        t: 'Afectaciones FinBO',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Afectaciones_FinIN',        t: 'Afectaciones FinIN',       type: 'num',    class: 'text-center' },
      { show: this.pcrcSelected != 6 ? false : true, op: null, field: 'Afectaciones_Total',        t: 'Afectaciones Total',       type: 'num',    class: 'text-center' },

    ]


    let result = []

    let qs = {
      monto     :{ q: {}, data: []},
      hotel     :{ q: {}, data: []},
      transfer  :{ q: {}, data: []},
      tour      :{ q: {}, data: []},
      fc        :{ q: {}, data: []},
      ahtIn     :{ q: {}, data: []},
      ahtOut    :{ q: {}, data: []},
      exceed    :{ q: {}, data: []}
    }, qCount=0

    for( let item of data ){
      if( parseFloat(item['Sesion']) >= parseFloat(avgSes) ){
        qs['monto']['data'].push(parseFloat(item['Monto']))
        qs['hotel']['data'].push(parseFloat(item['Hotel_All']))
        qs['transfer']['data'].push(parseFloat(item['Transfer_All']))
        qs['tour']['data'].push(parseFloat(item['Tour_All']))
        qs['fc']['data'].push(item['callsIn'] == 0 ? 0 : (item['LocsIn']/parseFloat(item['callsIn'])))
        qs['ahtIn']['data'].push(item['callsIn'] == 0 ? 0 : (item['TTIn']/parseFloat(item['callsIn'])))
        qs['ahtOut']['data'].push(item['callsOut'] == 0 ? 0 : (item['TTOut']/parseFloat(item['callsOut'])))
        qs['exceed']['data'].push(parseFloat(item['pausasExcedidas']))
        qCount++
      }
    }

    let qLimit = qCount/4
    qLimit = Math.round(qLimit)

    qs['monto']['q']      =this.quartile(qs['monto']['data'], qLimit, true)
    qs['hotel']['q']      =this.quartile(qs['hotel']['data'], qLimit, true)
    qs['transfer']['q']   =this.quartile(qs['transfer']['data'], qLimit, true)
    qs['tour']['q']       =this.quartile(qs['tour']['data'], qLimit, true)
    qs['fc']['q']         =this.quartile(qs['fc']['data'], qLimit, true)
    qs['ahtIn']['q']      =this.quartile(qs['ahtIn']['data'], qLimit, false)
    qs['ahtOut']['q']     =this.quartile(qs['ahtOut']['data'], qLimit, false)
    qs['exceed']['q']     =this.quartile(qs['exceed']['data'], qLimit, false)

      console.log(qs)

    for( let item of data ){

      let td = {}
      for( let field of this.tableConfig ){

        if( field.show ){
          if( field.type == 'q' ){
            if( parseFloat(item['Sesion']) >= parseFloat(avgSes) ){
              if( field.field[2] ){
                if( td[field.field[1]] < qs[field.field[0]]['q'][3] ){
                  td[field.t] = 4
                }else if( td[field.field[1]] < qs[field.field[0]]['q'][2] ){
                  td[field.t] = 3
                }else if( td[field.field[1]] < qs[field.field[0]]['q'][1] ){
                  td[field.t] = 2
                }else{
                  td[field.t] = 1
                }
              }else{
                if( td[field.field[1]] > qs[field.field[0]]['q'][3] ){
                  td[field.t] = 4
                }else if( td[field.field[1]] > qs[field.field[0]]['q'][2] ){
                  td[field.t] = 3
                }else if( td[field.field[1]] > qs[field.field[0]]['q'][1] ){
                  td[field.t] = 2
                }else{
                  td[field.t] = 1
                }
              }
            }else{
              td[field.t] = "NA"
            }

          }else{
            td[field.t] = field.type == 'text' ? (item[field.field] ? item[field.field] : '') : this.showData( item, field.op, field.field, field.type)
          }
        }
      }

      result.push(td)
    }

    this.builtData = result
  }

  quartile(data, limit, asc = true){
    let q = {
      1: null,
      2: null,
      3: null
    }

    let i = 1
    let x = 0

    if( !asc ){
      data.sort(function(a, b){return a-b})
    }else{
      data.sort(function(a, b){return b-a})
    }

    for( let val of data ){
      x++
      if(val == NaN ? 0 : val != q[i-1]){
        if(x >= limit){
          q[i] = val == NaN ? 0 : val
          x=0
          i++
        }
      }
    }

    return q

  }

}

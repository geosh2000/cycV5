import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-mp-mx',
  templateUrl: './mp-mx.component.html',
  styles: []
})
export class MpMxComponent implements OnInit {

  loading:Object = {}
  dataTable:any

  fields:any = [
    { name: 'Fecha',      field: 'Fecha',       tipo: 'fecha' },
    { name: 'Skill',      field: 'Skill',       tipo: 'texto' },
    { name: 'Grupo',      field: 'grupo',       tipo: 'texto' },
    { name: 'Depto',      field: 'Dep',         tipo: 'texto' },
    { name: 'Monto',      field: 'monto',       tipo: 'monto' },
    { name: 'Monto Hotel',field: 'monto_hotel', tipo: 'monto' },
    { name: 'Monto Tour',field: 'monto_tour', tipo: 'monto' },
    { name: 'Monto Transfer',field: 'monto_transfer', tipo: 'monto' },
    { name: 'Margen ',     field: 'margen',      tipo: 'monto' },
    { name: 'Margen Hotel',field: 'margen_hotel',tipo: 'monto' },
    { name: 'RN',         field: 'RN',          tipo: 'numero' },
    { name: 'Locs In',    field: 'LocsIn',      tipo: 'numero' },
    { name: 'Locs Out',   field: 'LocsOut',     tipo: 'numero' },
    { name: 'FC',         field: 'FC',          tipo: 'perc' },
    { name: 'Llamadas Ofrecidas',field: 'inOfrecidas',tipo: 'numero' },
    { name: 'Llamadas Contestadas',field: 'inContestadas',tipo: 'numero' },
    { name: 'Abandon',    field: 'pAbandon',    tipo: 'perc' },
    { name: 'SLA',        field: 'pSLA',        tipo: 'perc' },
    { name: 'AHT In',        field: 'inAHT',        tipo: 'numero' },
    { name: 'Transfer 2-min',field: 'inXfered', tipo: 'numero' },
    { name: 'Llamadas Out Efectivas',field: 'outEfectivas', tipo: 'numero' },
    { name: 'AHT Out',    field: 'outEfectivasAHT',tipo: 'numero' },
    { name: 'Llamadas Out Intentos',field: 'outIntentos', tipo: 'numero' },
    { name: 'Utilizacion',field: 'pUtilizacion',tipo: 'perc' },
    { name: 'Ocupacion',  field: 'pOcupacion',  tipo: 'perc' },
    { name: 'Ftes',       field: 'Ftes',        tipo: 'numero' },
    { name: 'HC',         field: 'HC_dia',      tipo: 'numero' }
  ]

  constructor(
                private _api:ApiService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService
                ) {

    moment.locale('es-MX')

  }

  ngOnInit() {
  }

  getData( inicio, fin, skill, params ){
    this.loading['data'] = true

    this._api.restfulPut( params, `Tablaf/mp/${inicio}/${fin}/${skill}` )
            .subscribe( res => {

              this.loading['data'] = false

              this.dataTable = []
              // tslint:disable-next-line:forin
              for( let dep in res['data'] ){
                let groups = []
                // tslint:disable-next-line:forin
                for( let group in res['data'][dep] ){
                  let fechas = []
                  // tslint:disable-next-line:forin
                  for( let fecha in res['data'][dep][group] ){
                    fechas.push({ date: fecha, data: res['data'][dep][group][fecha]})
                  }
                  groups.push({group: group, data: fechas})
                }
                this.dataTable.push({ dep: dep, data: groups})
              }

              console.log(this.dataTable)


            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)
            })
  }

  stringCont( string, text ){
    return string.includes(text)
  }

  download( title ){
    let books = {}
    for( let skill of this.dataTable ){
      let titleSheet = `${skill['dep']} - `
      for( let group of skill['data'] ){
        let titleOK = `${titleSheet}${group['group']}`
        let data = []
        for( let date of group['data'] ){
          data.push(date['data'])
        }
        books[titleOK]=data
      }
    }

    this.toXls( books, title )
  }

  toXls( sheets, title ){

    let wb: WorkBook = { SheetNames: [], Sheets: {} };

    let i = 1
    // tslint:disable-next-line:forin
    for(let ttl in sheets){
      wb.SheetNames.push(ttl);
      wb.Sheets[ttl] = utils.json_to_sheet(sheets[ttl], {cellDates: true});
    }

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

}

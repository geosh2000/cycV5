import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService } from '../../../../services/api.service';
import { TokenCheckService } from '../../../../services/token-check.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-soporte-mx',
  templateUrl: './soporte-mx.component.html',
  styles: []
})
export class SoporteMxComponent implements OnInit {

  loading:Object = {}
  dataTable:any

  fields:any = [
    { name: 'Fecha',      field: 'Fecha',       tipo: 'fecha' },
    { name: 'Skill',      field: 'Skill',       tipo: 'texto' },
    { name: 'Grupo',      field: 'grupo',       tipo: 'texto' },
    { name: 'Depto',      field: 'Dep',         tipo: 'texto' },
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

  getData( inicio, fin, skill ){
    this.loading['data'] = true

    this._api.restfulGet( `${inicio}/${fin}/${skill}`, 'Tablaf/mp' )
            .subscribe( res => {

              this.loading['data'] = false

              this.dataTable = []
              for( let dep in res['data'] ){
                let groups = []
                for( let group in res['data'][dep] ){
                  let fechas = []
                  for( let fecha in res['data'][dep][group] ){
                    fechas.push({ date: fecha, data: res['data'][dep][group][fecha]})
                  }
                  groups.push({group: group, data: fechas})
                }
                this.dataTable.push({ dep: dep, data: groups})
              }

              console.log(this.dataTable)


            }, err => {
              console.log("ERROR", err)

              this.loading['data'] = false

              let error = err.json()
              this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
              console.error(err.statusText, error.msg)
            })
  }

  stringCont( string, text ){
    return string.includes(text)
  }

  download( title ){
    let books = {}
    for( let skill of this.dataTable ){
      let title = `${skill['dep']} - `
      for( let group of skill['data'] ){
        let titleOK = `${title}${group['group']}`
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

    for(let title in sheets){
      wb.SheetNames.push(title);
      wb.Sheets[title] = utils.json_to_sheet(sheets[title], {cellDates: true});
    }

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

}

import { Component, OnInit } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';

import { EasyTableServiceService } from '../../../services/easy-table-service.service';

@Component({
  selector: 'app-mas-buscados-mp',
  templateUrl: './mas-buscados-mp.component.html',
  styles: []
})
export class MasBuscadosMpComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'default'

  loading:Object = {}
  data:Object = {}
  dataRAW:any = []
  destination:any

  addFormat = {
    destino: '',
    semana: '',
    anio: '',
    hotel: '',
    dispo: ''
  }

  add:Object = JSON.parse(JSON.stringify(this.addFormat))

  config:EasyTableServiceService
  columns:any = [
    { key: 'destino', title: 'Destino' },
    { key: 'semana', title: 'Tipo' },
    { key: 'anio', title: 'Incentivo' },
    { key: 'hotel', title: 'Nombre' },
    { key: 'dispo', title: 'Descuento' },
    { key: 'action', title: 'Acciones' }
  ]

  constructor(public _api: ApiService,
      public _init:InitService,
      private titleService: Title,
      private _tokenCheck:TokenCheckService,
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

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.config =  EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 50
    this.config['paginationRangeEnabled'] = true

    this.titleService.setTitle('CyC - Destinos Mas Buscados');
    this.getData()
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( '', 'Venta/masBuscado' )
            .subscribe( res => {

              this.loading['data'] = false
              let data = res['data']
              this.dataRAW = res['data']

              let result = {}

              for(let item of data){
                let grupo = `${item['destino'].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g,'').trim()}${item['semana']}${item['anio']}`
                if( !result[grupo] ){
                  result[grupo] = {
                    destino: item['destino'].trim(),
                    semana: item['semana'],
                    anio: item['anio'],
                    opciones: []
                  }
                }

                result[grupo]['opciones'].push({hotel: item['hotel'].trim(), dispo: parseFloat(item['dispo'])})
              }

              this.data = result

              console.log(res)
            }, err => {
              console.log('ERROR', err)

              this.loading['data'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  changeInc( field, row, val, inc, del = false ){
    this.updateData( inc ? val : (val.checked ? 1 : 0), row, field, del )
  }


  updateData( val, row, field, del ){
    this.loading['update'] = true

    let params = {
      id: row['id'],
      field: field,
      val: val,
      delete: del
    }

    this._api.restfulPut( params, 'Lists/updateMasBuscados' )
            .subscribe( res => {

              this.loading['update'] = false
              this.toastr.success( 'Información Modificada', 'Guardado' )
              row[field] = val
              this.getData()

              console.log(res)
            }, err => {
              console.log('ERROR', err)

              this.loading['update'] = false

              row[field] = val == 1 ? 0 : 1

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  addData(){
    this.loading['update'] = true

    this._api.restfulPut( this.add, 'Lists/addMasBuscados' )
            .subscribe( res => {

              this.loading['update'] = false
              this.toastr.success( 'Información Agregada', 'Guardado' )
              this.add = JSON.parse(JSON.stringify(this.addFormat))
              this.getData()

              console.log(res)
            }, err => {
              console.log('ERROR', err)

              this.loading['update'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })
  }

  addReg(){
    for( let field in this.add ){
      if( this.add[field] == '' ){
        this.toastr.error( `Todos los campos deben ser llenados. Falta: ${field}`, 'Error en formulario' )
        return false
      }
    }

    this.addData()
  }

  printDates( fd ){
    let first = moment(fd)
    // return '';
    return `${first.clone().add(1,'days').format('DD/MM/YYYY')} a ${first.add(7, 'days').format('DD/MM/YYYY')}`;
  }

}

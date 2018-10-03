import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService, InitService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-aviso-pdv',
  templateUrl: './aviso-pdv.component.html',
  styles: []
})
export class AvisoPdvComponent implements OnInit {

  @Input() avisos:any = []
  @Input() PDV:any = ''
  @Output() refresh = new EventEmitter

  loading:Object = {}

  constructor( private _api:ApiService, private toastr: ToastrService, public _init:InitService ) { }

  ngOnInit() {
  }

  printShort( name ){
    let fn = name.substr(0,1)
    let sn = name.substr(name.indexOf(' '),100)

    return `${fn}.${sn}`
  }

  update( id, flag ){

    // console.log(flag)

    let params = {
      status: flag,
      id: id
    }

    this._api.restfulPut( params, 'Navbar/avisosPdvUpd')
              .subscribe( res => {

                this.toastr.success('Registro Guardado', 'Guardado')
                this.refresh.emit( true )

              }, err => {
                console.log('ERROR', err)

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

                for( let item of this.avisos ){
                  if( parseInt(item['id']) == parseInt(id) ){
                    item['status'] = !flag
                    return false
                  }
                }

              })
  }

  delete( id ){

    this.loading['delete'] = true

    let params = {
      id: id
    }

    this._api.restfulPut( params, 'Navbar/deletePdvAdv')
              .subscribe( res => {

                this.toastr.success('Registro Borrado', 'Borrado')
                this.refresh.emit( true )

              }, err => {
                console.log('ERROR', err)

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

}

import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-corte',
  templateUrl: './corte.component.html',
  styles: []
})
export class CorteComponent implements OnInit {

  @Output() msg = new EventEmitter<any>()

  dataCxcs:any
  loading:boolean = false

  constructor(
              private _api: ApiService) {


  }

  ngOnInit() {
  }

  build( corte ){
      this.loading = true
      this._api.restfulGet( corte, 'cxc/aplicadosCorte' )
              .subscribe( res => {
                            if(res['ERR']){
                                this.msg.emit( { msg: res.msg, title: 'ERROR'} )
                            }else{
                                this.dataCxcs = res.data
                            }
                            this.loading = false

                          }, err => {
                            let errores = JSON.parse( err._body )
                            this.msg.emit( { msg: errores.msg, title: err.statusText} )
                            this.loading = false
                          })

  }

}

import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { ApiService } from '../../../services/api.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-bono-approve',
  templateUrl: './bono-approve.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonoApproveComponent implements OnInit {

  @Input() total:any = 0
  @Input() status:any
  @Input() params:any
  @Input() nombre:any
  @Input() dep:any
  @Input() puesto:any
  @Input() asesor:any
  @Input() reload:any

  @Output() save = new EventEmitter

  enableEdit:boolean = true
  reviewComments:any
  loading:Object = {}

  constructor( private _api:ApiService ) {

  }

  ngOnInit() {
    if( moment() > moment(`${this.params['anio']}-${(parseInt(this.params['mes'])+1)}-26`) ){
      this.enableEdit = false
    }
  }

  chgStatus( chg ){
    this.loading['change'] = true

    let params = {
      asesor: this.asesor,
      mes: this.params['mes'],
      anio: this.params['anio'],
      status: chg
    }

    if( chg == 3 ){
      params['review'] = 1
      params['review_notes'] = this.reviewComments
    }

    this._api.restfulPut( params, 'Bonos/chgStatus' )
            .subscribe( res => {

              this.loading['change'] = false
              this.save.emit({status: true, msg: 'Status Guardado', asesor: this.asesor, chg: params})
              jQuery('#exampleModal'+this.asesor).modal('hide')

            }, err => {
              console.log("ERROR", err)

              this.loading['change'] = false

              let error = err.json()
              this.save.emit({status: false, msg: error.msg, asesor: this.asesor})


            })
  }
}

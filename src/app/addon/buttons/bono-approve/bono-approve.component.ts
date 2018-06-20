import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

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
  alertMsg:any
  loading:Object = {}

  constructor( private _api:ApiService, public _init:InitService ) {

  }

  ngOnInit() {
    if( moment() > moment(`${this.params['anio']}-${(parseInt(this.params['mes'])+1)}-19`) ){
      this.enableEdit = false
    }
  }

  chgStatus( chg ){
    this.loading['change'] = true;

    let params = {
      asesor: this.asesor,
      mes: this.params['mes'],
      anio: this.params['anio'],
      status: chg
    }

    if( chg == 3 ){
      params['review'] = 1
      params['review_notes'] = this.status['comments']
    }

    let meta = {
      reviewer: 'Yo',
      comments: params['review_notes'],
      lu: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    this._api.restfulPut( {params: params, lu: this.status['lu']}, 'Bonos/chgStatus' )
            .subscribe( res => {

              this.loading['change'] = false

              jQuery('#exampleModal'+this.asesor).modal('hide')
              if(res.data['status']){
                this.save.emit({status: true, msg: 'Status Guardado', asesor: this.asesor, chg: params, meta: meta})
              }else{
                this.alertMsg = res.data['msg']
                this.save.emit({status: false, msg: res.data['msg'], asesor: this.asesor, chg: params, meta: res.meta})
                jQuery('#alertModal'+this.asesor).modal('show')
              }



            }, err => {
              console.log("ERROR", err)

              this.loading['change'] = false

              let error = err.json()
              this.save.emit({status: false, saved: true, msg: error.msg, asesor: this.asesor})


            })
  }

  printTime(time, format){
    return moment.tz(time, 'America/Mexico_City').tz('America/Bogota').format(format)
  }
}

import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-surv-historic',
  templateUrl: './surv-historic.component.html',
  styles: []
})

export class SurvHistoricComponent implements OnInit, OnChanges {

  @Input() asesor:any
  @Input() master:any
  @Input() divHeight:any

  loading:Object = {}
  data:any = []

  constructor( private _api:ApiService, private toastr:ToastrService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.asesor}/${this.master}`, `Survey/summary`)
        .subscribe( res => {

          this.loading['data'] = false
          this.data = res['data']

        }, err => {

          console.log('ERROR', err)

          this.loading['data'] = false

          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)

        })
  }

}
